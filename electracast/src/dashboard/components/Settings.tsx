import { User, Bell, Lock, Palette, Globe } from 'lucide-react'

export const Settings = () => {
  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#C9C16C] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        SETTINGS
      </h2>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-[#C9C16C]" />
          <h3
            className="text-xl text-[#C9C16C] tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            PROFILE
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                FULL NAME
              </label>
              <input
                type="text"
                defaultValue="Sarah Mitchell"
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </div>
            <div>
              <label
                className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                EMAIL
              </label>
              <input
                type="email"
                defaultValue="sarah@techwavesradio.com"
                className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              PODCAST NAME
            </label>
            <input
              type="text"
              defaultValue="Tech Waves Radio"
              className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none"
            />
          </div>

          <div>
            <label
              className="block text-sm text-[#b0b0b0] mb-2 tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              BIO
            </label>
            <textarea
              defaultValue="Exploring the intersection of technology and culture since 2018. Broadcasting weekly insights on innovation, AI, and the future of digital society."
              className="w-full bg-[#000000] border-2 border-[#2a2a2a] text-[#ffffff] px-4 py-3 rounded-sm focus:border-[#C9C16C] outline-none h-24 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-[#C9C16C]" />
          <h3
            className="text-xl text-[#C9C16C] tracking-wider"
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
              className="flex items-center justify-between p-4 bg-[#000000] border-2 border-[#2a2a2a] rounded-sm"
            >
              <label
                htmlFor={notification.id}
                className="text-[#ffffff] tracking-wide"
                style={{ fontFamily: 'monospace' }}
              >
                {notification.label.toUpperCase()}
              </label>
              <input
                type="checkbox"
                id={notification.id}
                className="w-5 h-5 accent-[#C9C16C]"
                defaultChecked={notification.checked}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#C9C16C]" />
            <h3
              className="text-xl text-[#C9C16C] tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              SECURITY
            </h3>
          </div>

          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              CHANGE PASSWORD
            </button>
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              TWO-FACTOR AUTH
            </button>
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              ACTIVE SESSIONS
            </button>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-[#C9C16C]" />
            <h3
              className="text-xl text-[#C9C16C] tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              DISPLAY
            </h3>
          </div>

          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              TOGGLE DARK MODE
            </button>
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              FONT SIZE
            </button>
            <button
              className="w-full px-4 py-3 bg-[#000000] text-[#ffffff] border-2 border-[#2a2a2a] hover:border-[#C9C16C] transition-all text-left tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              LAYOUT DENSITY
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-[#C9C16C]" />
          <h3
            className="text-xl text-[#C9C16C] tracking-wider"
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
              className="flex items-center justify-between p-4 bg-[#000000] border-2 border-[#2a2a2a] rounded-sm"
            >
              <span className="text-[#ffffff] tracking-wide">{integration.name}</span>
              <span
                className={`text-xs px-3 py-1 border rounded-sm tracking-wider ${
                  integration.status === 'CONNECTED'
                    ? 'text-[#C9C16C] border-[#C9C16C]'
                    : integration.status === 'PENDING'
                    ? 'text-[#A89D4C] border-[#A89D4C]'
                    : 'text-[#b0b0b0] border-[#b0b0b0]'
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
