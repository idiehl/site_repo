import { useEffect, useState } from 'react'
import { Mic, Square, Pause, Play, Save, Trash2 } from 'lucide-react'

export const Recording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
        setAudioLevel(Math.random() * 100)
      }, 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, isPaused])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev)
  }

  const handleDiscard = () => {
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
  }

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#C9C16C] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        RECORDING STUDIO
      </h2>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <div className="text-center space-y-8">
          <div className="bg-[#000000] border-2 border-[#2a2a2a] p-8 rounded-sm">
            <p
              className="text-6xl text-[#C9C16C] tracking-wider mb-4"
              style={{ fontFamily: 'monospace' }}
            >
              {formatTime(recordingTime)}
            </p>
            <div className="flex items-center justify-center gap-2">
              {isRecording && !isPaused ? (
                <>
                  <div className="w-3 h-3 bg-[#9c4242] rounded-full animate-pulse" />
                  <span
                    className="text-sm text-[#9c4242] tracking-wider"
                    style={{ fontFamily: 'monospace' }}
                  >
                    RECORDING
                  </span>
                </>
              ) : isPaused ? (
                <span
                  className="text-sm text-[#C9C16C] tracking-wider"
                  style={{ fontFamily: 'monospace' }}
                >
                  PAUSED
                </span>
              ) : (
                <span
                  className="text-sm text-[#b0b0b0] tracking-wider"
                  style={{ fontFamily: 'monospace' }}
                >
                  READY
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#000000] border-2 border-[#2a2a2a] p-6 rounded-sm">
            <p
              className="text-xs text-[#b0b0b0] mb-4 tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              AUDIO LEVEL
            </p>
            <div className="flex items-end justify-center gap-1 h-24">
              {Array.from({ length: 40 }).map((_, i) => {
                const height =
                  isRecording && !isPaused ? Math.max(10, Math.random() * audioLevel) : 10
                return (
                  <div
                    key={i}
                    className="w-2 bg-[#C9C16C] transition-all duration-100 rounded-sm"
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="w-24 h-24 bg-[#C9C16C] border-4 border-[#A89D4C] rounded-full flex items-center justify-center hover:bg-[#A89D4C] transition-all shadow-lg"
              >
                <Mic className="w-12 h-12 text-[#000000]" />
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="w-20 h-20 bg-[#b0b0b0] border-4 border-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#ffffff] transition-all"
                >
                  {isPaused ? (
                    <Play className="w-10 h-10 text-[#000000] ml-1" />
                  ) : (
                    <Pause className="w-10 h-10 text-[#000000]" />
                  )}
                </button>
                <button
                  onClick={handleStopRecording}
                  className="w-24 h-24 bg-[#9c4242] border-4 border-[#7a4242] rounded-full flex items-center justify-center hover:bg-[#b85656] transition-all shadow-lg"
                >
                  <Square className="w-12 h-12 text-[#000000]" />
                </button>
              </>
            )}
          </div>

          {isRecording ? (
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handleStopRecording}
                className="px-8 py-3 bg-[#C9C16C] text-[#000000] border-2 border-[#A89D4C] hover:bg-[#A89D4C] transition-all tracking-wider flex items-center gap-2"
                style={{ fontFamily: 'monospace' }}
              >
                <Save className="w-5 h-5" />
                SAVE RECORDING
              </button>
              <button
                onClick={handleDiscard}
                className="px-8 py-3 bg-[#0f0f0f] text-[#9c4242] border-2 border-[#2a2a2a] hover:border-[#9c4242] transition-all tracking-wider flex items-center gap-2"
                style={{ fontFamily: 'monospace' }}
              >
                <Trash2 className="w-5 h-5" />
                DISCARD
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            INPUT DEVICE
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                MICROPHONE
              </label>
              <select
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                style={{ fontFamily: 'monospace' }}
              >
                <option>SHURE SM7B (DEFAULT)</option>
                <option>RODE PODMIC</option>
                <option>AUDIO-TECHNICA AT2020</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                INPUT GAIN
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="65"
                className="w-full h-2 bg-[#000000] border-2 border-[#2a2a2a] rounded-sm outline-none accent-[#C9C16C]"
              />
              <div
                className="flex justify-between text-xs text-[#b0b0b0] mt-1"
                style={{ fontFamily: 'monospace' }}
              >
                <span>0%</span>
                <span>65%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            RECORDING SETTINGS
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                SAMPLE RATE
              </label>
              <select
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                style={{ fontFamily: 'monospace' }}
              >
                <option>48 kHz (RECOMMENDED)</option>
                <option>44.1 kHz</option>
                <option>96 kHz</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                BIT DEPTH
              </label>
              <select
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                style={{ fontFamily: 'monospace' }}
              >
                <option>24-bit (RECOMMENDED)</option>
                <option>16-bit</option>
                <option>32-bit</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                NOISE REDUCTION
              </label>
              <select
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                style={{ fontFamily: 'monospace' }}
              >
                <option>MEDIUM (DEFAULT)</option>
                <option>LOW</option>
                <option>HIGH</option>
                <option>OFF</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
