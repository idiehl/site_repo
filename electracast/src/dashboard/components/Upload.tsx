import { useState } from 'react'
import { Upload as UploadIcon, File as FileIcon, X, Calendar, Clock } from 'lucide-react'

export const Upload = () => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true)
    } else if (event.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0])
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setUploadedFile(file)
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#C9C16C] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        UPLOAD EPISODE
      </h2>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <div
          className={`border-4 border-dashed rounded-sm p-12 text-center transition-all ${
            dragActive ? 'border-[#C9C16C] bg-[#1a1a1a]' : 'border-[#2a2a2a]'
          } ${uploadedFile ? 'bg-[#000000]' : 'bg-[#0f0f0f]'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <>
              <UploadIcon className="w-16 h-16 text-[#C9C16C] mx-auto mb-6" />
              <h3
                className="text-xl text-[#ffffff] mb-4 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                DRAG & DROP AUDIO FILE
              </h3>
              <p className="text-[#b0b0b0] mb-6">
                Supports: MP3, WAV, M4A, FLAC (Max 500MB)
              </p>
              <label className="inline-block cursor-pointer">
                <input type="file" className="hidden" onChange={handleChange} />
                <span
                  className="px-8 py-3 bg-[#C9C16C] text-[#000000] border-2 border-[#A89D4C] hover:bg-[#A89D4C] transition-all tracking-wider inline-block"
                  style={{ fontFamily: 'monospace' }}
                >
                  SELECT FILE
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#0f0f0f] border-2 border-[#2a2a2a] p-4 rounded-sm">
                <div className="flex items-center gap-4">
                  <FileIcon className="w-8 h-8 text-[#C9C16C]" />
                  <div className="text-left">
                    <p className="text-[#ffffff]">{uploadedFile.name}</p>
                    <p className="text-xs text-[#b0b0b0]">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-[#b0b0b0] hover:text-[#E57373]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#b0b0b0]">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#000000] border-2 border-[#2a2a2a] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#C9C16C] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {uploadProgress === 100 ? (
                <div className="text-center text-[#C9C16C] text-sm tracking-wider">
                  UPLOAD COMPLETE
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            EPISODE DETAILS
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                TITLE
              </label>
              <input
                type="text"
                placeholder="Episode title..."
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                DESCRIPTION
              </label>
              <textarea
                rows={4}
                placeholder="Episode description..."
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            SCHEDULE PUBLISH
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                PUBLISH DATE
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b0b0b0]" />
                <input
                  type="date"
                  className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] pl-12 pr-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                PUBLISH TIME
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b0b0b0]" />
                <input
                  type="time"
                  className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] pl-12 pr-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                className="w-full px-6 py-3 bg-[#C9C16C] text-[#000000] border-2 border-[#A89D4C] hover:bg-[#A89D4C] transition-all tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                SCHEDULE RELEASE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
