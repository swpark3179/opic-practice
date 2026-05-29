import { Store, load } from '@tauri-apps/plugin-store';
import { PracticeStats } from '../context/AppContext';
import type { ApiConfig, FeedbackHistoryEntry } from './feedback/types';

const API_CONFIG_KEY = 'apiConfig';
const FEEDBACK_HISTORY_KEY = 'feedbackHistory';
const FEEDBACK_HISTORY_CAP = 50;

class StorageService {
  private store: Store | null = null;
  private isTauri = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if ((window as any).__TAURI_INTERNALS__) {
      this.isTauri = true;
      this.initPromise = load('store.json').then(s => {
        this.store = s;
      }).catch(e => console.error("Failed to load store", e));
    }
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.isTauri) {
      if (this.initPromise) await this.initPromise;
      if (this.store) {
        const val = await this.store.get<T>(key);
        return val !== null && val !== undefined ? val : defaultValue;
      }
      return defaultValue;
    }
    const val = localStorage.getItem(key);
    if (val) {
      try { return JSON.parse(val) as T; } catch { /* fall through */ }
    }
    return defaultValue;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.isTauri) {
      if (this.initPromise) await this.initPromise;
      if (this.store) {
        await this.store.set(key, value);
        await this.store.save();
      }
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Method to save audio recording (Extension Point 1)
  // We can use @tauri-apps/plugin-fs to save blobs to the app's local data directory
  async saveAudioRecording(blob: Blob, topicId: string): Promise<string | null> {
    if (!this.isTauri) {
      // In browser, we can just return a blob URL
      return URL.createObjectURL(blob);
    }

    try {
      // Extension point: actual file system saving
      // const buffer = await blob.arrayBuffer();
      // const path = await resolveResource(`recordings/${topicId}_${Date.now()}.webm`);
      // await writeFile(path, new Uint8Array(buffer));
      // return path;
      return URL.createObjectURL(blob); // fallback for now
    } catch (e) {
      console.error("Failed to save audio", e);
      return null;
    }
  }

  async getApiConfig(): Promise<ApiConfig | null> {
    return this.get<ApiConfig | null>(API_CONFIG_KEY, null);
  }

  async setApiConfig(cfg: ApiConfig): Promise<void> {
    await this.set(API_CONFIG_KEY, cfg);
  }

  async listFeedbackHistory(): Promise<FeedbackHistoryEntry[]> {
    return this.get<FeedbackHistoryEntry[]>(FEEDBACK_HISTORY_KEY, []);
  }

  async appendFeedbackHistory(entry: FeedbackHistoryEntry): Promise<void> {
    const list = await this.listFeedbackHistory();
    const next = [entry, ...list].slice(0, FEEDBACK_HISTORY_CAP);
    await this.set(FEEDBACK_HISTORY_KEY, next);
  }
}

export const storage = new StorageService();
