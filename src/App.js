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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {/* Settings Icon */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
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

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Vibe Workout Timer</h1>
                
                {/* Settings Section */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showSettings ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Workout Time (seconds):
                          <input
                            type="number"
                            value={settings.workoutTime}
                            onChange={(e) => updateSetting('workoutTime', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={isActive}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Break Time (seconds):
                          <input
                            type="number"
                            value={settings.breakTime}
                            onChange={(e) => updateSetting('breakTime', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={isActive}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Number of Intervals:
                          <input
                            type="number"
                            value={settings.intervals}
                            onChange={(e) => updateSetting('intervals', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            disabled={isActive}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">
                    {timeLeft}
                  </div>
                  <div className="text-xl mb-4">
                    {phase !== 'ready' && `Interval ${currentInterval}/${settings.intervals}`}
                  </div>
                  <div className="text-lg mb-4">
                    {isBreak ? 'Break Time' : phase === 'workout' ? 'Workout Time' : ''}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  {!isActive ? (
                    <button
                      onClick={startWorkout}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={resetWorkout}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 