import { BookOpen, Sparkles, FileText, ArrowRight } from 'lucide-react'

export const Help = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-[#C9C16C] tracking-wider" style={{ fontFamily: 'monospace' }}>
        HELP
      </h2>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <p className="text-[#b0b0b0] mb-4">
          A curated help directory is being built for ElectraCast podcasters. Start here for the
          basics and check back as we add walkthroughs.
        </p>
        <p className="text-[#b0b0b0]">
          Need support right now? Use the public <a href="/contact" className="text-[#C9C16C] underline">contact form</a>.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] p-6 rounded-sm hover:border-[#C9C16C] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#C9C16C]" />
            <h3 className="text-lg text-[#ffffff]">Getting Started</h3>
          </div>
          <p className="text-sm text-[#b0b0b0] mb-4">
            Create a podcast submission, wait for review, then manage your show from the dashboard.
          </p>
          <p className="text-xs text-[#b0b0b0] flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
            COMING SOON <ArrowRight className="w-4 h-4" />
          </p>
        </div>

        <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] p-6 rounded-sm hover:border-[#C9C16C] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#C9C16C]" />
            <h3 className="text-lg text-[#ffffff]">New User Guide</h3>
          </div>
          <p className="text-sm text-[#b0b0b0] mb-4">
            A step-by-step guide covering naming, artwork, distribution, and episode publishing.
          </p>
          <p className="text-xs text-[#b0b0b0] flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
            COMING SOON <ArrowRight className="w-4 h-4" />
          </p>
        </div>

        <div className="bg-[#0f0f0f] border-2 border-[#2a2a2a] p-6 rounded-sm hover:border-[#C9C16C] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#C9C16C]" />
            <h3 className="text-lg text-[#ffffff]">Ask ElectraCast AI</h3>
          </div>
          <p className="text-sm text-[#b0b0b0] mb-4">
            A chat-based helper for platform questions (requires a knowledge base + guardrails).
          </p>
          <p className="text-xs text-[#b0b0b0] flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
            PLANNED <ArrowRight className="w-4 h-4" />
          </p>
        </div>
      </div>
    </div>
  )
}

