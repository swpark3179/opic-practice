import { Store, load } from '@tauri-apps/plugin-store';
import { PracticeStats } from '../context/AppContext';

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
    } else {
      const val = localStorage.getItem(key);
      if (val) {
        try { return JSON.parse(val); } catch(e) {}
      }
      return defaultValue;
    }
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

  // Extension Point 2: AI Feedback
  async getAIFeedback(transcript: string, sample: string): Promise<string> {
    // Placeholder for actual AI integration (e.g. Gemini API)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("AI Feedback: Your answer was good, but you could improve your vocabulary by using words like 'moreover' and 'furthermore'.");
      }, 1500);
    });
  }
}

export const storage = new StorageService();
