import { useState, useEffect, useRef } from 'react';
import { FocusSession, FocusSettings } from '../types';

export const useFocusTimer = (
  initialSettings: FocusSettings, 
  onSessionComplete: (session: FocusSession) => void
) => {
  const [settings, setSettings] = useState<FocusSettings>(initialSettings);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialSettings.timerDuration * 60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distractions, setDistractions] = useState(0);
  
  // Punishment States (Visual triggers)
  const [isBlurred, setIsBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Sync internal time left if settings change while inactive
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings.timerDuration * 60);
    }
  }, [settings.timerDuration, isActive]);

  // --- Distraction Logic ---
  useEffect(() => {
    const handleDistraction = () => {
      if (!isActive || isPaused) return;

      setDistractions(prev => prev + 1);
      
      // Punishment: Audio
      if (settings.punishments.audio) {
        const audio = new Audio('/audio/motivation.mp3');
        audio.play().catch(() => {
          const utterance = new SpeechSynthesisUtterance("Padh le! Exam hai teri!");
          utterance.rate = 1.2;
          window.speechSynthesis.speak(utterance);
        });
      }

      // Punishment: Penalty Time
      if (settings.punishments.penaltyTime && settings.mode === 'countdown') {
         setTimeLeft(prev => prev + 60);
      }

      // Punishment: Blur Screen
      if (settings.punishments.blurScreen) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }

      // Punishment: Popup
      if (settings.punishments.popupWarning) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }

      // Auto Pause on Tab Switch
      if (settings.autoPause) {
        setIsPaused(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleDistraction();
    };

    const handleWindowBlur = () => {
      // Intentionally checking logic here to ensure navigation inside app doesn't trigger blur
      // Note: window.blur fires when clicking iframe or alt-tab. 
      // Navigating inside the app (SPA) does NOT trigger window.blur or visibilitychange.
      if (document.activeElement?.tagName === 'IFRAME') return; 
      handleDistraction();
    };

    if (isActive) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, isPaused, settings]);

  // --- Timer Interval ---
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = window.setInterval(() => {
        if (settings.mode === 'countdown') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleStop(true); // Complete
              return 0;
            }
            return prev - 1;
          });
        }
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, settings.mode]);

  // --- Actions ---
  const handleStart = () => {
    if (!isActive) {
      setTimeLeft(settings.timerDuration * 60);
      setElapsedTime(0);
      setDistractions(0);
      startTimeRef.current = Date.now();
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => setIsPaused(true);

  const handleStop = (completed: boolean = false) => {
    setIsActive(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (elapsedTime > 60) {
      const session: FocusSession = {
        id: crypto.randomUUID(),
        startTime: startTimeRef.current || Date.now(),
        endTime: Date.now(),
        durationMinutes: Math.floor(elapsedTime / 60),
        distractionCount: distractions,
        focusScore: Math.max(0, 100 - (distractions * 5))
      };
      onSessionComplete(session);
    }

    if (!completed) {
      setTimeLeft(settings.timerDuration * 60);
      setElapsedTime(0);
    }
  };

  return {
    settings, setSettings,
    isActive, isPaused,
    timeLeft, elapsedTime,
    distractions,
    isBlurred, showWarning,
    handleStart, handlePause, handleStop
  };
};
