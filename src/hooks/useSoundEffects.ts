import { useCallback, useRef } from "react";

// AudioContext singleton to avoid creating multiple instances
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function useSoundEffects() {
  const isEnabledRef = useRef(true);

  // Play a simple synthesized tone
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // Quest complete sound - ascending chime
  const playQuestComplete = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Play ascending notes
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.08 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        
        oscillator.start(ctx.currentTime + i * 0.08);
        oscillator.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // Level up sound - epic fanfare
  const playLevelUp = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Epic level up fanfare
      const melody = [
        { freq: 523.25, time: 0, duration: 0.15 },      // C5
        { freq: 659.25, time: 0.1, duration: 0.15 },    // E5
        { freq: 783.99, time: 0.2, duration: 0.15 },    // G5
        { freq: 1046.50, time: 0.35, duration: 0.4 },   // C6 (hold)
        { freq: 987.77, time: 0.55, duration: 0.15 },   // B5
        { freq: 1046.50, time: 0.7, duration: 0.5 },    // C6 (final)
      ];
      
      melody.forEach(({ freq, time, duration }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + time + 0.02);
        gainNode.gain.setValueAtTime(0.35, ctx.currentTime + time + duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
        
        oscillator.start(ctx.currentTime + time);
        oscillator.stop(ctx.currentTime + time + duration);
      });
      
      // Add bass note
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      bassGain.gain.setValueAtTime(0.2, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // Achievement unlock sound - magical sparkle
  const playAchievement = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      
      // Sparkle effect with multiple quick notes
      const sparkles = [
        { freq: 1318.51, time: 0, duration: 0.2 },     // E6
        { freq: 1567.98, time: 0.05, duration: 0.2 },  // G6
        { freq: 2093.00, time: 0.1, duration: 0.3 },   // C7
        { freq: 1567.98, time: 0.2, duration: 0.2 },   // G6
        { freq: 2093.00, time: 0.3, duration: 0.4 },   // C7
      ];
      
      sparkles.forEach(({ freq, time, duration }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
        
        oscillator.start(ctx.currentTime + time);
        oscillator.stop(ctx.currentTime + time + duration);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // XP gain sound - quick blip
  const playXPGain = useCallback(() => {
    if (!isEnabledRef.current) return;
    playTone(880, 0.1, "sine", 0.15); // A5
    setTimeout(() => playTone(1108.73, 0.15, "sine", 0.15), 50); // C#6
  }, [playTone]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    playQuestComplete,
    playLevelUp,
    playAchievement,
    playXPGain,
    setEnabled,
  };
}
