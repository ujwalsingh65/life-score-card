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

  // Create a deep, electronic drone base for Solo Leveling style
  const createSystemDrone = useCallback((ctx: AudioContext, startTime: number, duration: number, baseFreq: number) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(baseFreq, startTime);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, startTime);
    filter.Q.setValueAtTime(5, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gainNode.gain.setValueAtTime(0.15, startTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, []);

  // System notification blip - Solo Leveling style digital sound
  const playSystemBlip = useCallback((frequency: number, duration: number, volume = 0.25) => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Main digital tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.type = "square";
      osc1.frequency.setValueAtTime(frequency, currentTime);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(frequency * 2, currentTime);
      
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(frequency * 1.5, currentTime);
      filter.Q.setValueAtTime(2, currentTime);
      
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
      
      osc1.start(currentTime);
      osc1.stop(currentTime + duration);
      osc2.start(currentTime);
      osc2.stop(currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // Quest complete - System notification "QUEST COMPLETE" style
  const playQuestComplete = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Deep system drone intro
      createSystemDrone(ctx, currentTime, 0.4, 80);
      
      // Digital ascending notification tones
      const tones = [
        { freq: 220, time: 0.05, duration: 0.12 },
        { freq: 330, time: 0.15, duration: 0.12 },
        { freq: 440, time: 0.25, duration: 0.15 },
        { freq: 660, time: 0.38, duration: 0.25 },
      ];
      
      tones.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, currentTime + time);
        
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 2, currentTime + time);
        filter.Q.setValueAtTime(3, currentTime + time);
        
        gain.gain.setValueAtTime(0, currentTime + time);
        gain.gain.linearRampToValueAtTime(0.2, currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + time + duration);
        
        osc.start(currentTime + time);
        osc.stop(currentTime + time + duration);
      });
      
      // Final confirmation ping
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.connect(pingGain);
      pingGain.connect(ctx.destination);
      pingOsc.type = "sine";
      pingOsc.frequency.setValueAtTime(880, currentTime + 0.5);
      pingGain.gain.setValueAtTime(0.3, currentTime + 0.5);
      pingGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.9);
      pingOsc.start(currentTime + 0.5);
      pingOsc.stop(currentTime + 0.9);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [createSystemDrone]);

  // Level up - Epic system power-up sound like "LEVEL UP" notification
  const playLevelUp = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Deep bass impact
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(55, currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(30, currentTime + 0.8);
      bassGain.gain.setValueAtTime(0.4, currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.8);
      bassOsc.start(currentTime);
      bassOsc.stop(currentTime + 0.8);
      
      // Rising power sweep
      const sweepOsc = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      const sweepFilter = ctx.createBiquadFilter();
      sweepOsc.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      sweepOsc.type = "sawtooth";
      sweepOsc.frequency.setValueAtTime(100, currentTime);
      sweepOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.6);
      sweepFilter.type = "lowpass";
      sweepFilter.frequency.setValueAtTime(200, currentTime);
      sweepFilter.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.5);
      sweepGain.gain.setValueAtTime(0, currentTime);
      sweepGain.gain.linearRampToValueAtTime(0.25, currentTime + 0.1);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.7);
      sweepOsc.start(currentTime);
      sweepOsc.stop(currentTime + 0.7);
      
      // System confirmation melody
      const melody = [
        { freq: 440, time: 0.3, duration: 0.15 },
        { freq: 554.37, time: 0.4, duration: 0.15 },
        { freq: 659.25, time: 0.5, duration: 0.15 },
        { freq: 880, time: 0.65, duration: 0.35 },
      ];
      
      melody.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, currentTime + time);
        
        gain.gain.setValueAtTime(0, currentTime + time);
        gain.gain.linearRampToValueAtTime(0.3, currentTime + time + 0.02);
        gain.gain.setValueAtTime(0.3, currentTime + time + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + time + duration);
        
        osc.start(currentTime + time);
        osc.stop(currentTime + time + duration);
      });
      
      // High shimmer harmonics
      [1760, 2200, 2640].forEach((freq, i) => {
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);
        shimmerOsc.type = "sine";
        shimmerOsc.frequency.setValueAtTime(freq, currentTime + 0.7 + i * 0.03);
        shimmerGain.gain.setValueAtTime(0.08, currentTime + 0.7 + i * 0.03);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.2);
        shimmerOsc.start(currentTime + 0.7 + i * 0.03);
        shimmerOsc.stop(currentTime + 1.2);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // Achievement unlock - System window opening sound with authority
  const playAchievement = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Initial system "ping" alert
      const alertOsc = ctx.createOscillator();
      const alertGain = ctx.createGain();
      alertOsc.connect(alertGain);
      alertGain.connect(ctx.destination);
      alertOsc.type = "sine";
      alertOsc.frequency.setValueAtTime(1200, currentTime);
      alertOsc.frequency.setValueAtTime(800, currentTime + 0.08);
      alertGain.gain.setValueAtTime(0.25, currentTime);
      alertGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
      alertOsc.start(currentTime);
      alertOsc.stop(currentTime + 0.15);
      
      // Digital unlock sequence
      const sequence = [
        { freq: 440, time: 0.1, duration: 0.08 },
        { freq: 550, time: 0.18, duration: 0.08 },
        { freq: 660, time: 0.26, duration: 0.08 },
        { freq: 880, time: 0.34, duration: 0.15 },
        { freq: 1100, time: 0.48, duration: 0.2 },
      ];
      
      sequence.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, currentTime + time);
        
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 1.5, currentTime + time);
        filter.Q.setValueAtTime(5, currentTime + time);
        
        gain.gain.setValueAtTime(0, currentTime + time);
        gain.gain.linearRampToValueAtTime(0.15, currentTime + time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + time + duration);
        
        osc.start(currentTime + time);
        osc.stop(currentTime + time + duration);
      });
      
      // Authority confirmation deep tone
      createSystemDrone(ctx, currentTime + 0.5, 0.4, 110);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [createSystemDrone]);

  // XP gain - Quick digital notification blip
  const playXPGain = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Double blip notification
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      // First blip
      osc1.type = "square";
      osc1.frequency.setValueAtTime(660, currentTime);
      gain1.gain.setValueAtTime(0.12, currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.06);
      osc1.start(currentTime);
      osc1.stop(currentTime + 0.06);
      
      // Second higher blip
      osc2.type = "square";
      osc2.frequency.setValueAtTime(880, currentTime + 0.07);
      gain2.gain.setValueAtTime(0.15, currentTime + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
      osc2.start(currentTime + 0.07);
      osc2.stop(currentTime + 0.15);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  // System window open sound
  const playSystemOpen = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    try {
      const ctx = getAudioContext();
      const currentTime = ctx.currentTime;
      
      // Woosh effect
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(500, currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.15);
      noiseFilter.Q.setValueAtTime(1, currentTime);
      
      noiseGain.gain.setValueAtTime(0.1, currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
      
      noiseSource.start(currentTime);
      noiseSource.stop(currentTime + 0.3);
      
      // Digital ping
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.connect(pingGain);
      pingGain.connect(ctx.destination);
      pingOsc.type = "sine";
      pingOsc.frequency.setValueAtTime(1000, currentTime + 0.1);
      pingGain.gain.setValueAtTime(0.2, currentTime + 0.1);
      pingGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
      pingOsc.start(currentTime + 0.1);
      pingOsc.stop(currentTime + 0.25);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    playQuestComplete,
    playLevelUp,
    playAchievement,
    playXPGain,
    playSystemOpen,
    playSystemBlip,
    setEnabled,
  };
}
