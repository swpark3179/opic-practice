# Feedback API Contract

This document is the contract between the **opic-practice** Tauri client and the **user-operated backend** that calls an LLM provider and returns OPIc feedback. The client knows nothing about which provider or model the backend uses — it only speaks the wire protocol below.

## Endpoint

`POST {baseUrl}/v1/feedback`

The base URL is configured in-app under "Settings". Any path-mountable origin works; the client will append `/v1/feedback` verbatim.

## Request

### Headers

| Header | Value |
| ------ | ----- |
| `Authorization` | `Bearer <token>` (the token configured in-app) |
| `Content-Type` | `application/json` |
| `Accept` | `text/event-stream` |

### Body

```json
{
  "question":   "Describe a memorable trip you took recently.",
  "transcript": "So last summer I went to Jeju with my family...",
  "level":      "IH",
  "criteria":   ["grammar", "vocabulary", "fluency_structure", "overall"],
  "language":   "en",
  "client":     { "app": "opic-practice", "version": "0.1.0" }
}
```

- `level` ∈ `"IL" | "IH" | "AL"` — the user's self-assessment level (what they're aiming at).
- `criteria` is an allow-list. The client always sends all four.
- `language` is the language of the answer. Reserved for future i18n; currently always `"en"`.

## Response

The endpoint MUST respond with `Content-Type: text/event-stream`.

Each event is a single `data:` line followed by the standard `\n\n` terminator. The payload of every `data:` event is a JSON object that is a **partial of `FeedbackResult`** (see Schema below). The client deep-merges these partials at the **top level**; array fields (`grammar`, `vocabulary`) must be sent as **full snapshots**, not item-deltas, to keep the client parser trivial.

The stream terminates with the literal sentinel:

```
data: [DONE]
```

### Schema (`FeedbackResult`)

```ts
type OpicLevel = 'IL' | 'IM' | 'IH' | 'AL';

interface FeedbackResult {
  overall_level?:     OpicLevel;
  overall_summary?:   string;                                                    // 2-3 sentences in Korean
  grammar?:           Array<{ original: string; corrected: string; explanation_ko: string }>;
  vocabulary?:        Array<{ original: string; upgraded:  string; reason_ko:      string }>;
  fluency_structure?: { score_0_10: number; comments_ko: string[] };
}
```

All fields are optional during streaming. By the time `[DONE]` is sent, the backend SHOULD have populated at least `overall_level`, `overall_summary`, and `fluency_structure`. Missing fields are rendered as "—" in the UI.

### Sample stream

```
data: {"overall_level":"IM"}

data: {"overall_summary":"전반적으로 의사 전달은 명확하지만,"}

data: {"overall_summary":"전반적으로 의사 전달은 명확하지만, 시제 일관성과 연결어 사용을 다듬으면 IH로 올라설 수 있습니다."}

data: {"grammar":[{"original":"I go there last year","corrected":"I went there last year","explanation_ko":"과거 사건이므로 went로 써야 합니다."}]}

data: {"vocabulary":[{"original":"very good","upgraded":"absolutely fantastic","reason_ko":"감정 강도를 명확히 하는 표현입니다."}]}

data: {"fluency_structure":{"score_0_10":6,"comments_ko":["문장 사이의 연결어가 부족합니다.","에피소드 하나를 더 깊이 풀어보세요."]}}

data: [DONE]
```

Each `data:` line MUST be a syntactically valid JSON object on its own. Do not split a single JSON value across multiple `data:` lines.

## Errors

If the backend cannot complete the request, it sends a final `error` event **before** closing the stream:

```
event: error
data: {"code":"rate_limited","message":"Too many requests","retry_after_ms":15000}
```

The client recognizes these codes and renders matching UI:

| Code | UI behaviour |
| ---- | ------------ |
| `unauthenticated`  | "토큰이 만료되었거나 잘못됐어요" + "설정 열기" CTA |
| `rate_limited`     | Countdown using `retry_after_ms`; retry disabled until elapsed |
| `bad_request`      | Generic "요청 형식이 잘못됐어요" |
| `upstream_failure` | "LLM 응답을 받지 못했어요. 다시 시도해주세요." |
| `internal`         | "백엔드 내부 오류" |

If the stream is terminated without a sentinel and without an `error` event (TCP reset, etc.), the client treats it as a network error and preserves whatever was already parsed.

## Health check

`GET {baseUrl}/health` — used by the in-app "Test connection" button. Any 2xx is success. Body is ignored.

## Mock server for local verification

Two quick options to verify the client without a real LLM:

### Option A — Python one-liner (stdlib only)

Save as `mock_feedback.py`:

```python
import http.server, time

SAMPLE = [
    b'data: {"overall_level":"IM"}\n\n',
    b'data: {"overall_summary":"\xec\xa0\x84\xeb\xb0\x98\xec\xa0\x81\xec\x9c\xbc\xeb\xa1\x9c \xeb\xaa\x85\xed\x99\x95\xed\x95\xa9\xeb\x8b\x88\xeb\x8b\xa4."}\n\n',
    b'data: {"grammar":[{"original":"I go there last year","corrected":"I went there last year","explanation_ko":"\xea\xb3\xbc\xea\xb1\xb0 \xec\x8b\x9c\xec\xa0\x9c."}]}\n\n',
    b'data: {"vocabulary":[{"original":"very good","upgraded":"absolutely fantastic","reason_ko":"\xea\xb0\x95\xeb\x8f\x84."}]}\n\n',
    b'data: {"fluency_structure":{"score_0_10":6,"comments_ko":["\xec\x97\xb0\xea\xb2\xb0\xec\x96\xb4\xea\xb0\x80 \xeb\xb6\x80\xec\xa1\xb1."]}}\n\n',
    b'data: [DONE]\n\n',
]

class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        for chunk in SAMPLE:
            self.wfile.write(chunk); self.wfile.flush(); time.sleep(0.4)
    def do_GET(self):  # /health
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')

http.server.HTTPServer(('127.0.0.1', 8787), H).serve_forever()
```

Run `python3 mock_feedback.py`, point the app's settings at `http://127.0.0.1:8787`, any bearer string works.

### Option B — fault-injection variants

Replace one chunk with malformed JSON (`b'data: {bad\n\n'`) — the client must keep rendering using the last good parse. Send `event: error\ndata: {"code":"rate_limited","message":"slow down","retry_after_ms":5000}\n\n` instead of `[DONE]` — the client must show the countdown UI.

## Out of scope for this contract

- Audio uploads (the client always sends transcribed text).
- Per-criterion deep-streaming (arrays are snapshots, not item deltas).
- Multi-turn / follow-up questions.
- Pronunciation scoring.
