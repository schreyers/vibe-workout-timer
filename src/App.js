import React, { useState, useEffect, useRef } from 'react';

function App() {
  // Default settings
  const [settings, setSettings] = useState({
    workoutTime: 45,
    breakTime: 15,
    intervals: 8
  });

  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3); // Initial countdown
  const [phase, setPhase] = useState('ready'); // 'ready', 'countdown', 'workout', 'break'
  const [showSettings, setShowSettings] = useState(false);

  // Audio setup
  const audioRef = useRef(new Audio(process.env.PUBLIC_URL + '/beep-sound.wav'));

  // Function to play the beep sound
  const playBeep = () => {
    audioRef.current.currentTime = 0; // Reset the audio to start
    audioRef.current.play();
  };

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft(time => {
            // Play beep for any countdown (3,2,1) in any phase
            if (time <= 3 && time > 0) {
              playBeep();
            }
            return time - 1;
          });
        } else {
          // Phase transitions
          if (phase === 'countdown') {
            setPhase('workout');
            setTimeLeft(settings.workoutTime);
          } else if (phase === 'workout') {
            if (currentInterval < settings.intervals) {
              setPhase('break');
              setIsBreak(true);
              setTimeLeft(settings.breakTime);
            } else {
              // Workout complete
              setIsActive(false);
              setPhase('ready');
              setCurrentInterval(1);
            }
          } else if (phase === 'break') {
            setPhase('workout');
            setIsBreak(false);
            setTimeLeft(settings.workoutTime);
            setCurrentInterval(interval => interval + 1);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, currentInterval, settings]);

  // Preload the audio
  useEffect(() => {
    audioRef.current.load();
  }, []);

  const startWorkout = () => {
    setIsActive(true);
    setPhase('countdown');
    setTimeLeft(3);
  };

  const resetWorkout = () => {
    setIsActive(false);
    setIsBreak(false);
    setCurrentInterval(1);
    setTimeLeft(3);
    setPhase('ready');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className={`w-full max-w-md h-[90vh] rounded-3xl p-6 relative page-transition ${
        isBreak 
          ? 'timer-gradient-rest'
          : 'timer-gradient-exercise'
      }`}>
        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          disabled={isActive}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-x-6 top-20 bg-white/10 backdrop-blur-lg rounded-2xl p-6 glass-button">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">
                  Workout Time (seconds)
                  <input
                    type="number"
                    value={settings.workoutTime}
                    onChange={(e) => updateSetting('workoutTime', e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-white/10 border-white/20 text-white"
                    disabled={isActive}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Break Time (seconds)
                  <input
                    type="number"
                    value={settings.breakTime}
                    onChange={(e) => updateSetting('breakTime', e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-white/10 border-white/20 text-white"
                    disabled={isActive}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Number of Intervals
                  <input
                    type="number"
                    value={settings.intervals}
                    onChange={(e) => updateSetting('intervals', e.target.value)}
                    className="mt-1 block w-full rounded-lg bg-white/10 border-white/20 text-white"
                    disabled={isActive}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-white text-xl font-medium text-center mt-6">
          {isBreak ? 'Rest' : 'Exercise'}
        </div>

        {/* Timer Circle */}
        <div className="flex items-center justify-center mt-20">
          <div className="timer-circle">
            <div className="w-64 h-64 rounded-full border-4 border-white/30 flex items-center justify-center">
              <div className="timer-content text-center text-white">
                <div className="text-6xl font-light mb-1">{formatTime(timeLeft)}</div>
                <div className="text-sm opacity-80">Round {currentInterval} of {settings.intervals}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pause Button */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <button
            onClick={isActive ? resetWorkout : startWorkout}
            className="glass-button bg-white/20 hover:bg-white/30 text-white px-12 py-3 rounded-full transition-colors"
          >
            {isActive ? 'PAUSE' : 'START'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App; 