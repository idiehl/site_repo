import { useState, useEffect } from 'react';
import { Mic, Square, Pause, Play, Save, Trash2 } from 'lucide-react';

export function Recording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
        // Simulate audio level changes
        setAudioLevel(Math.random() * 100);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleDiscard = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
        RECORDING STUDIO
      </h2>

      {/* Recording Interface */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="text-center space-y-8">
          {/* Recording Timer */}
          <div className="bg-[#070B1A] border-2 border-[#1D1B35] p-8 rounded-sm">
            <p className="text-6xl text-[#C89E3E] tracking-wider mb-4" style={{ fontFamily: 'monospace' }}>
              {formatTime(recordingTime)}
            </p>
            <div className="flex items-center justify-center gap-2">
              {isRecording && !isPaused && (
                <>
                  <div className="w-3 h-3 bg-[#9c4242] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[#9c4242] tracking-wider" style={{ fontFamily: 'monospace' }}>
                    RECORDING
                  </span>
                </>
              )}
              {isPaused && (
                <span className="text-sm text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
                  PAUSED
                </span>
              )}
              {!isRecording && (
                <span className="text-sm text-[#8A94A6] tracking-wider" style={{ fontFamily: 'monospace' }}>
                  READY
                </span>
              )}
            </div>
          </div>

          {/* Audio Level Visualizer */}
          <div className="bg-[#070B1A] border-2 border-[#1D1B35] p-6 rounded-sm">
            <p className="text-xs text-[#8A94A6] mb-4 tracking-wider" style={{ fontFamily: 'monospace' }}>
              AUDIO LEVEL
            </p>
            <div className="flex items-end justify-center gap-1 h-24">
              {Array.from({ length: 40 }).map((_, i) => {
                const height = isRecording && !isPaused 
                  ? Math.max(10, Math.random() * audioLevel) 
                  : 10;
                return (
                  <div
                    key={i}
                    className="w-2 bg-[#C89E3E] transition-all duration-100 rounded-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="w-24 h-24 bg-[#C89E3E] border-4 border-[#D4A94E] rounded-full flex items-center justify-center hover:bg-[#D4A94E] transition-all shadow-lg"
              >
                <Mic className="w-12 h-12 text-[#070B1A]" />
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="w-20 h-20 bg-[#8A94A6] border-4 border-[#1D1B35] rounded-full flex items-center justify-center hover:bg-[#BCC5D0] transition-all"
                >
                  {isPaused ? (
                    <Play className="w-10 h-10 text-[#070B1A] ml-1" />
                  ) : (
                    <Pause className="w-10 h-10 text-[#070B1A]" />
                  )}
                </button>
                <button
                  onClick={handleStopRecording}
                  className="w-24 h-24 bg-[#9c4242] border-4 border-[#7a4242] rounded-full flex items-center justify-center hover:bg-[#b85656] transition-all shadow-lg"
                >
                  <Square className="w-12 h-12 text-[#070B1A]" />
                </button>
              </>
            )}
          </div>

          {isRecording && (
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handleStopRecording}
                className="px-8 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider flex items-center gap-2"
                style={{ fontFamily: 'monospace' }}
              >
                <Save className="w-5 h-5" />
                SAVE RECORDING
              </button>
              <button
                onClick={handleDiscard}
                className="px-8 py-3 bg-[#0B1226] text-[#9c4242] border-2 border-[#1D1B35] hover:border-[#9c4242] transition-all tracking-wider flex items-center gap-2"
                style={{ fontFamily: 'monospace' }}
              >
                <Trash2 className="w-5 h-5" />
                DISCARD
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3 className="text-xl text-[#D4A94E] mb-6 tracking-wider" style={{ fontFamily: 'monospace' }}>
            INPUT DEVICE
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                MICROPHONE
              </label>
              <select className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none" style={{ fontFamily: 'monospace' }}>
                <option>SHURE SM7B (DEFAULT)</option>
                <option>RODE PODMIC</option>
                <option>AUDIO-TECHNICA AT2020</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                INPUT GAIN
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="65"
                className="w-full h-2 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm outline-none accent-[#C89E3E]"
              />
              <div className="flex justify-between text-xs text-[#8A94A6] mt-1" style={{ fontFamily: 'monospace' }}>
                <span>0%</span>
                <span>65%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3 className="text-xl text-[#D4A94E] mb-6 tracking-wider" style={{ fontFamily: 'monospace' }}>
            RECORDING SETTINGS
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                FORMAT
              </label>
              <select className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none" style={{ fontFamily: 'monospace' }}>
                <option>MP3 - 320 KBPS</option>
                <option>WAV - 48 KHZ</option>
                <option>FLAC - LOSSLESS</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="noise-reduction"
                className="w-4 h-4 accent-[#C89E3E]"
                defaultChecked
              />
              <label htmlFor="noise-reduction" className="text-sm text-[#EEFCF1] tracking-wide" style={{ fontFamily: 'monospace' }}>
                NOISE REDUCTION
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-normalize"
                className="w-4 h-4 accent-[#C89E3E]"
                defaultChecked
              />
              <label htmlFor="auto-normalize" className="text-sm text-[#EEFCF1] tracking-wide" style={{ fontFamily: 'monospace' }}>
                AUTO NORMALIZE
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm">
        <h3 className="text-sm text-[#D4A94E] mb-4 tracking-wider" style={{ fontFamily: 'monospace' }}>
          RECORDING TIPS
        </h3>
        <ul className="space-y-2 text-sm text-[#8A94A6]">
          <li>• Maintain 6-8 inches distance from microphone for optimal audio quality</li>
          <li>• Monitor audio levels - keep peaks in the -12dB to -6dB range</li>
          <li>• Record in a quiet environment to minimize background noise</li>
          <li>• Use headphones to monitor audio without feedback</li>
        </ul>
      </div>
    </div>
  );
}