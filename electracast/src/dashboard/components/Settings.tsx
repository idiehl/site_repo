import { User, Bell, Lock, Palette, Globe } from 'lucide-react'

export const Settings = () => {
  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#D4A94E] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        SETTINGS
      </h2>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-[#C89E3E]" />
          <h3
            className="text-xl text-[#D4A94E] tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            PROFILE
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                FULL NAME
              </label>
              <input
                type="text"
                defaultValue="Sarah Mitchell"
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                EMAIL
              </label>
              <input
                type="email"
                defaultValue="sarah@techwavesradio.com"
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              PODCAST NAME
            </label>
            <input
              type="text"
              defaultValue="Tech Waves Radio"
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
            />
          </div>

          <div>
            <label
              className="block text-sm text-[#8A94A6] mb-2 tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              BIO
            </label>
            <textarea
              defaultValue="Exploring the intersection of technology and culture since 2018. Broadcasting weekly insights on innovation, AI, and the future of digital society."
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none h-24 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-[#C89E3E]" />
          <h3
            className="text-xl text-[#D4A94E] tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            NOTIFICATIONS
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { id: 'new-subscribers', label: 'New Subscribers', checked: true },
            { id: 'episode-milestones', label: 'Episode Milestones', checked: true },
            { id: 'comments', label: 'New Comments', checked: false },
            { id: 'weekly-report', label: 'Weekly Analytics Report', checked: true },
            { id: 'system-updates', label: 'System Updates', checked: true },
          ].map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm"
            >
              <label
                htmlFor={notification.id}
                className="text-[#EEFCF1] tracking-wide"
                style={{ fontFamily: 'monospace' }}
              >
                {notification.label.toUpperCase()}
              </label>
              <input
                type="checkbox"
                id={notification.id}
                className="w-5 h-5 accent-[#C89E3E]"
                defaultChecked={notification.checked}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#C89E3E]" />
            <h3
              className="text-xl text-[#D4A94E] tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              SECURITY
            </h3>
          </div>

          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              CHANGE PASSWORD
            </button>
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              TWO-FACTOR AUTH
            </button>
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              ACTIVE SESSIONS
            </button>
          </div>
        </div>

        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-[#C89E3E]" />
            <h3
              className="text-xl text-[#D4A94E] tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              DISPLAY
            </h3>
          </div>

          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              TOGGLE DARK MODE
            </button>
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              FONT SIZE
            </button>
            <button
              className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              LAYOUT DENSITY
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-[#C89E3E]" />
          <h3
            className="text-xl text-[#D4A94E] tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            INTEGRATIONS
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { name: 'SPOTIFY', status: 'CONNECTED' },
            { name: 'APPLE PODCASTS', status: 'CONNECTED' },
            { name: 'GOOGLE PODCASTS', status: 'PENDING' },
            { name: 'AMAZON MUSIC', status: 'DISCONNECTED' },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm"
            >
              <span className="text-[#EEFCF1] tracking-wide">{integration.name}</span>
              <span
                className={`text-xs px-3 py-1 border rounded-sm tracking-wider ${
                  integration.status === 'CONNECTED'
                    ? 'text-[#C89E3E] border-[#C89E3E]'
                    : integration.status === 'PENDING'
                    ? 'text-[#E8C97A] border-[#E8C97A]'
                    : 'text-[#8A94A6] border-[#8A94A6]'
                }`}
              >
                {integration.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
