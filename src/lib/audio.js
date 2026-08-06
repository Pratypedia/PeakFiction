export const playElevatorDing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // First tone (higher)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    // Second tone (lower)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3); // E5
    
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.3);
    gain2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.32);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 1.3);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
