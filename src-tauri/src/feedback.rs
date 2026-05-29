use dashmap::DashMap;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::task::JoinHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    pub bearer: String,
    #[serde(default, rename = "modelHint")]
    pub model_hint: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct FeedbackRequestPayload {
    pub question: String,
    pub transcript: String,
    pub level: String,
    pub criteria: Vec<String>,
}

#[derive(Debug, Serialize)]
struct OutboundBody<'a> {
    question: &'a str,
    transcript: &'a str,
    level: &'a str,
    criteria: &'a [String],
    language: &'a str,
    client: OutboundClient<'a>,
    #[serde(skip_serializing_if = "Option::is_none")]
    model_hint: Option<&'a str>,
}

#[derive(Debug, Serialize)]
struct OutboundClient<'a> {
    app: &'a str,
    version: &'a str,
}

#[derive(Debug, Serialize, Clone)]
struct DeltaPayload {
    raw: String,
}

#[derive(Debug, Serialize, Clone)]
struct ErrorPayload {
    code: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    retry_after_ms: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct TestResult {
    pub ok: bool,
    pub status: Option<u16>,
    pub message: Option<String>,
}

#[derive(Default)]
pub struct RequestRegistry {
    inner: Arc<DashMap<String, JoinHandle<()>>>,
}

impl RequestRegistry {
    fn insert(&self, id: String, handle: JoinHandle<()>) {
        self.inner.insert(id, handle);
    }
    fn remove(&self, id: &str) -> Option<JoinHandle<()>> {
        self.inner.remove(id).map(|(_, h)| h)
    }
}

#[tauri::command]
pub async fn request_feedback(
    app: AppHandle,
    payload: FeedbackRequestPayload,
) -> Result<String, String> {
    let cfg = read_config(&app).await?;
    let id = uuid::Uuid::new_v4().to_string();
    let id_clone = id.clone();
    let app_clone = app.clone();

    let task = tokio::spawn(async move {
        run_stream(app_clone.clone(), id_clone.clone(), cfg, payload).await;
        if let Some(state) = app_clone.try_state::<RequestRegistry>() {
            state.remove(&id_clone);
        }
    });

    let state = app.state::<RequestRegistry>();
    state.insert(id.clone(), task);
    Ok(id)
}

#[tauri::command]
pub async fn cancel_feedback(state: State<'_, RequestRegistry>, id: String) -> Result<(), String> {
    if let Some(handle) = state.remove(&id) {
        handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn test_api_config(cfg: ApiConfig) -> Result<TestResult, String> {
    let url = format!("{}/health", cfg.base_url.trim_end_matches('/'));
    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
    {
        Ok(c) => c,
        Err(e) => return Ok(TestResult { ok: false, status: None, message: Some(e.to_string()) }),
    };
    match client
        .get(&url)
        .bearer_auth(&cfg.bearer)
        .send()
        .await
    {
        Ok(resp) => {
            let status = resp.status();
            Ok(TestResult {
                ok: status.is_success(),
                status: Some(status.as_u16()),
                message: if status.is_success() { None } else { Some(format!("HTTP {}", status)) },
            })
        }
        Err(e) => Ok(TestResult { ok: false, status: None, message: Some(e.to_string()) }),
    }
}

async fn read_config(app: &AppHandle) -> Result<ApiConfig, String> {
    use tauri_plugin_store::StoreExt;
    let store = app.store("store.json").map_err(|e| e.to_string())?;
    let value = store
        .get("apiConfig")
        .ok_or_else(|| "API 설정이 없습니다.".to_string())?;
    serde_json::from_value::<ApiConfig>(value).map_err(|e| e.to_string())
}

async fn run_stream(
    app: AppHandle,
    id: String,
    cfg: ApiConfig,
    payload: FeedbackRequestPayload,
) {
    let url = format!("{}/v1/feedback", cfg.base_url.trim_end_matches('/'));
    let body = OutboundBody {
        question: &payload.question,
        transcript: &payload.transcript,
        level: &payload.level,
        criteria: &payload.criteria,
        language: "en",
        client: OutboundClient { app: "opic-practice", version: env!("CARGO_PKG_VERSION") },
        model_hint: cfg.model_hint.as_deref(),
    };

    let client = match reqwest::Client::builder().build() {
        Ok(c) => c,
        Err(e) => return emit_error(&app, &id, "internal", &e.to_string(), None),
    };

    let resp = match client
        .post(&url)
        .bearer_auth(&cfg.bearer)
        .header("Accept", "text/event-stream")
        .json(&body)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => return emit_error(&app, &id, "network", &e.to_string(), None),
    };

    let status = resp.status();
    if !status.is_success() {
        let code = match status.as_u16() {
            401 => "unauthenticated",
            429 => "rate_limited",
            400 => "bad_request",
            500..=599 => "upstream_failure",
            _ => "internal",
        };
        let msg = format!("HTTP {}", status);
        return emit_error(&app, &id, code, &msg, None);
    }

    let mut stream = resp.bytes_stream();
    let mut buffer: Vec<u8> = Vec::new();

    while let Some(chunk_result) = stream.next().await {
        let chunk = match chunk_result {
            Ok(c) => c,
            Err(e) => return emit_error(&app, &id, "network", &e.to_string(), None),
        };
        buffer.extend_from_slice(&chunk);

        // Split off complete events separated by "\n\n".
        loop {
            let split = find_event_boundary(&buffer);
            let Some(end) = split else { break };
            let event_bytes = buffer.drain(..end.0).collect::<Vec<u8>>();
            buffer.drain(..end.1); // skip the separator
            let raw_event = String::from_utf8_lossy(&event_bytes).to_string();
            if !handle_event(&app, &id, &raw_event) {
                return;
            }
        }
    }
    // Stream ended without [DONE] sentinel.
    let _ = app.emit(&format!("feedback:done:{}", id), serde_json::json!({}));
}

/// Returns (event_len, separator_len) where event_len is the byte index
/// where the event payload ends and separator_len is how many bytes to skip after.
fn find_event_boundary(buffer: &[u8]) -> Option<(usize, usize)> {
    // Look for "\n\n" or "\r\n\r\n".
    let mut i = 0;
    while i + 1 < buffer.len() {
        if buffer[i] == b'\n' && buffer[i + 1] == b'\n' {
            return Some((i, 2));
        }
        if i + 3 < buffer.len()
            && buffer[i] == b'\r'
            && buffer[i + 1] == b'\n'
            && buffer[i + 2] == b'\r'
            && buffer[i + 3] == b'\n'
        {
            return Some((i, 4));
        }
        i += 1;
    }
    None
}

/// Parses a single SSE event block. Returns false if streaming should stop.
fn handle_event(app: &AppHandle, id: &str, raw: &str) -> bool {
    let mut event_name: Option<&str> = None;
    let mut data_lines: Vec<&str> = Vec::new();
    for line in raw.lines() {
        if let Some(rest) = line.strip_prefix("event:") {
            event_name = Some(rest.trim());
        } else if let Some(rest) = line.strip_prefix("data:") {
            data_lines.push(rest.trim_start());
        }
    }
    let data = data_lines.join("\n");
    if data.is_empty() {
        return true;
    }
    if event_name == Some("error") {
        let (code, message, retry_after_ms) = parse_error(&data);
        emit_error(app, id, &code, &message, retry_after_ms);
        return false;
    }
    if data.trim() == "[DONE]" {
        let _ = app.emit(&format!("feedback:done:{}", id), serde_json::json!({}));
        return false;
    }
    let _ = app.emit(
        &format!("feedback:delta:{}", id),
        DeltaPayload { raw: data },
    );
    true
}

fn parse_error(data: &str) -> (String, String, Option<u64>) {
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(data) {
        let code = v.get("code").and_then(|x| x.as_str()).unwrap_or("internal").to_string();
        let message = v.get("message").and_then(|x| x.as_str()).unwrap_or("").to_string();
        let retry_after_ms = v.get("retry_after_ms").and_then(|x| x.as_u64());
        (code, message, retry_after_ms)
    } else {
        ("internal".into(), data.to_string(), None)
    }
}

fn emit_error(app: &AppHandle, id: &str, code: &str, message: &str, retry_after_ms: Option<u64>) {
    let _ = app.emit(
        &format!("feedback:error:{}", id),
        ErrorPayload {
            code: code.to_string(),
            message: message.to_string(),
            retry_after_ms,
        },
    );
}
