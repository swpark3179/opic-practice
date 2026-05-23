export class TTSService {
  private synth = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public speak(text: string, rate: number = 0.8, onEnd?: () => void) {
    this.stop();
    
    if (!this.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Try to find a good English voice
    const voices = this.synth.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    
    // Prefer Google US English or standard US English
    const preferred = enVoices.find(v => v.name.includes('Google') && v.lang === 'en-US') 
      || enVoices.find(v => v.lang === 'en-US') 
      || enVoices[0];
      
    if (preferred) {
      utterance.voice = preferred;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public isSpeaking() {
    return this.synth.speaking;
  }
}

export const tts = new TTSService();

// Needs a hack for Chrome/Edge to load voices initially
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices are loaded
  };
}
