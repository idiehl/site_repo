import { User, Bell, Lock, Palette, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
        SETTINGS
      </h2>

      {/* Profile Settings */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-[#C89E3E]" />
          <h3 className="text-xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
            PROFILE
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                FULL NAME
              </label>
              <input
                type="text"
                defaultValue="Sarah Mitchell"
                className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
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
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              PODCAST NAME
            </label>
            <input
              type="text"
              defaultValue="Tech Waves Radio"
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
              BIO
            </label>
            <textarea
              defaultValue="Exploring the intersection of technology and culture since 2018. Broadcasting weekly insights on innovation, AI, and the future of digital society."
              className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none h-24 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-[#C89E3E]" />
          <h3 className="text-xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
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
            <div key={notification.id} className="flex items-center justify-between p-4 bg-[#070B1A] border-2 border-[#1D1B35] rounded-sm">
              <label htmlFor={notification.id} className="text-[#EEFCF1] tracking-wide" style={{ fontFamily: 'monospace' }}>
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
        {/* Security */}
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#C89E3E]" />
            <h3 className="text-xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
              SECURITY
            </h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider" style={{ fontFamily: 'monospace' }}>
              CHANGE PASSWORD
            </button>
            <button className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider" style={{ fontFamily: 'monospace' }}>
              TWO-FACTOR AUTH
            </button>
            <button className="w-full px-4 py-3 bg-[#070B1A] text-[#EEFCF1] border-2 border-[#1D1B35] hover:border-[#C89E3E] transition-all text-left tracking-wider" style={{ fontFamily: 'monospace' }}>
              ACTIVE SESSIONS
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-[#C89E3E]" />
            <h3 className="text-xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
              PREFERENCES
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                LANGUAGE
              </label>
              <select className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none" style={{ fontFamily: 'monospace' }}>
                <option>ENGLISH</option>
                <option>ESPAÑOL</option>
                <option>FRANÇAIS</option>
                <option>DEUTSCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#8A94A6] mb-2 tracking-wider" style={{ fontFamily: 'monospace' }}>
                TIMEZONE
              </label>
              <select className="w-full bg-[#070B1A] border-2 border-[#1D1B35] text-[#EEFCF1] px-4 py-3 rounded-sm focus:border-[#C89E3E] outline-none" style={{ fontFamily: 'monospace' }}>
                <option>UTC-5 (EST)</option>
                <option>UTC-8 (PST)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Platforms */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-[#C89E3E]" />
          <h3 className="text-xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
            DISTRIBUTION
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Spotify', connected: true },
            { name: 'Apple Podcasts', connected: true },
            { name: 'Google Podcasts', connected: true },
            { name: 'Amazon Music', connected: false },
            { name: 'YouTube', connected: true },
            { name: 'RSS Feed', connected: true },
          ].map((platform) => (
            <div 
              key={platform.name}
              className={`
                p-4 border-2 rounded-sm text-center
                ${platform.connected 
                  ? 'bg-[#070B1A] border-[#D4A94E]' 
                  : 'bg-[#0B1226] border-[#1D1B35]'
                }
              `}
            >
              <p className="text-[#EEFCF1] mb-2 tracking-wide" style={{ fontFamily: 'monospace' }}>
                {platform.name.toUpperCase()}
              </p>
              <span 
                className={`
                  text-xs tracking-wider
                  ${platform.connected ? 'text-[#D4A94E]' : 'text-[#8A94A6]'}
                `}
                style={{ fontFamily: 'monospace' }}
              >
                {platform.connected ? '✓ CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-4 bg-[#0B1226] text-[#8A94A6] border-2 border-[#1D1B35] hover:border-[#C89E3E] hover:text-[#C89E3E] transition-all tracking-wider" style={{ fontFamily: 'monospace' }}>
          CANCEL
        </button>
        <button className="px-8 py-4 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider" style={{ fontFamily: 'monospace' }}>
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}