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
        className="text-3xl text-[#D4A94E] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        UPLOAD EPISODE
      </h2>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div
          className={`border-4 border-dashed rounded-sm p-12 text-center transition-all ${
            dragActive ? 'border-[#D4A94E] bg-[#1A2744]' : 'border-[#1D1B35]'
          } ${uploadedFile ? 'bg-[#070B1A]' : 'bg-[#0B1226]'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <>
              <UploadIcon className="w-16 h-16 text-[#C89E3E] mx-auto mb-6" />
              <h3
                className="text-xl text-[#EEFCF1] mb-4 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                DRAG & DROP AUDIO FILE
              </h3>
              <p className="text-[#8A94A6] mb-6">
                Supports: MP3, WAV, M4A, FLAC (Max 500MB)
              </p>
              <label className="inline-block cursor-pointer">
                <input type="file" className="hidden" onChange={handleChange} />
                <span
                  className="px-8 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider inline-block"
                  style={{ fontFamily: 'monospace' }}
                >
                  SELECT FILE
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#0B1226] border-2 border-[#1D1B35] p-4 rounded-sm">
                <div className="flex items-center gap-4">
                  <FileIcon className="w-8 h-8 text-[#C89E3E]" />
                  <div className="text-left">
                    <p className="text-[#EEFCF1]">{uploadedFile.name}</p>
                    <p className="text-xs text-[#8A94A6]">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-[#8A94A6] hover:text-[#E57373]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#8A94A6]">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#C89E3E] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {uploadProgress === 100 ? (
                <div className="text-center text-[#C89E3E] text-sm tracking-wider">
                  UPLOAD COMPLETE
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            EPISODE DETAILS
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                TITLE
              </label>
              <input
                type="text"
                placeholder="Episode title..."
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                DESCRIPTION
              </label>
              <textarea
                rows={4}
                placeholder="Episode description..."
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            SCHEDULE PUBLISH
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                PUBLISH DATE
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A6]" />
                <input
                  type="date"
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] pl-12 pr-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                PUBLISH TIME
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A6]" />
                <input
                  type="time"
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] pl-12 pr-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                className="w-full px-6 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider"
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
