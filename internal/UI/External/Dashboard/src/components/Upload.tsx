import { useState } from 'react';
import { Upload as UploadIcon, File, X, Calendar, Clock } from 'lucide-react';

export function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
        UPLOAD EPISODE
      </h2>

      {/* Upload Area */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div
          className={`
            border-4 border-dashed rounded-sm p-12 text-center transition-all
            ${dragActive ? 'border-[#D4A94E] bg-[#1A2744]' : 'border-[#1D1B35]'}
            ${uploadedFile ? 'bg-[#070B1A]' : 'bg-[#0B1226]'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <>
              <UploadIcon className="w-16 h-16 text-[#C89E3E] mx-auto mb-6" />
              <h3 className="text-xl text-[#EEFCF1] mb-4 tracking-wider" style={{ fontFamily: 'monospace' }}>
                DRAG & DROP AUDIO FILE
              </h3>
              <p className="text-[#8A94A6] mb-6">
                Supports: MP3, WAV, M4A, FLAC (Max 500MB)
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleChange}
                />
                <span className="px-8 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all cursor-pointer inline-block tracking-wider" style={{ fontFamily: 'monospace' }}>
                  SELECT FILE
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0B1226] border-2 border-[#1D1B35] p-4 rounded-sm">
                <div className="flex items-center gap-4">
                  <File className="w-8 h-8 text-[#C89E3E]" />
                  <div className="text-left">
                    <p className="text-[#EEFCF1]">{uploadedFile.name}</p>
                    <p className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 border-2 border-[#1D1B35] hover:border-[#9c4242] hover:text-[#9c4242] transition-all rounded-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {uploadProgress < 100 ? (
                <div>
                  <div className="flex justify-between mb-2 text-sm text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
                    <span>UPLOADING...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-4 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-[#C89E3E] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-[#D4A94E] text-sm tracking-wider" style={{ fontFamily: 'monospace' }}>
                  ✓ UPLOAD COMPLETE
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Episode Details Form */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <h3 className="text-xl text-[#D4A94E] mb-6 tracking-wider" style={{ fontFamily: 'monospace' }}>
          EPISODE DETAILS
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              EPISODE TITLE
            </label>
            <input
              type="text"
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              placeholder="Enter episode title..."
            />
          </div>

          <div>
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              DESCRIPTION
            </label>
            <textarea
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none h-32 resize-none"
              placeholder="Episode description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                PUBLISH DATE
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A6]" />
                <input
                  type="date"
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] pl-12 pr-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                PUBLISH TIME
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A94A6]" />
                <input
                  type="time"
                  className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] pl-12 pr-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              TAGS
            </label>
            <input
              type="text"
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              placeholder="technology, AI, future (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              STATUS
            </label>
            <div className="flex gap-4">
              {['Draft', 'Scheduled', 'Publish Now'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="w-4 h-4 accent-[#C89E3E]"
                    defaultChecked={status === 'Draft'}
                  />
                  <span className="text-[#EEFCF1] text-sm tracking-wide" style={{ fontFamily: 'monospace' }}>
                    {status.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button className="flex-1 px-8 py-4 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider" style={{ fontFamily: 'monospace' }}>
              SAVE EPISODE
            </button>
            <button className="px-8 py-4 bg-[#0B1226] text-[#8A94A6] border-2 border-[#1D1B35] hover:border-[#C89E3E] hover:text-[#C89E3E] transition-all tracking-wider" style={{ fontFamily: 'monospace' }}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}