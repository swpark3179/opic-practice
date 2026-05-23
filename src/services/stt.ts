export class STTService {
  private recognition: any = null;
  private onResultCb: ((text: string, isFinal: boolean) => void) | null = null;
  private onEndCb: (() => void) | null = null;
  private isListening = false;
  private intentionallyStopped = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onResultCb) {
          if (finalTranscript) this.onResultCb(finalTranscript, true);
          if (interimTranscript) this.onResultCb(interimTranscript, false);
        }
      };

      this.recognition.onend = () => {
        if (!this.intentionallyStopped && this.isListening) {
          // Restart if it stopped automatically (happens in some browsers after pause)
          try {
            this.recognition.start();
          } catch(e) {}
        } else {
          this.isListening = false;
          if (this.onEndCb) this.onEndCb();
        }
      };
      
      this.recognition.onerror = (e: any) => {
        console.error("STT Error:", e.error);
        if (e.error === 'not-allowed') {
          this.intentionallyStopped = true;
          this.stop();
        }
      };
    }
  }

  public isSupported() {
    return this.recognition !== null;
  }

  public start(onResult: (text: string, isFinal: boolean) => void, onEnd?: () => void) {
    if (!this.recognition) return;
    this.onResultCb = onResult;
    this.onEndCb = onEnd || null;
    this.intentionallyStopped = false;
    
    if (!this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.error("Failed to start STT", e);
      }
    }
  }

  public stop() {
    this.intentionallyStopped = true;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch(e) {}
    }
  }
}

export const stt = new STTService();
