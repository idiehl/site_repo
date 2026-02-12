import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Mic,
  Upload,
  Radio,
  Settings,
  Home,
  LogOut,
  PlusCircle,
} from 'lucide-react'
import { useDashboardData } from '../DashboardDataContext'
import SiteHeader from '../../components/SiteHeader'

type DashboardLayoutProps = {
  onLogout?: () => void
}

export const DashboardLayout = ({ onLogout }: DashboardLayoutProps) => {
  const location = useLocation()
  const { podcaster } = useDashboardData()
  const basePath = '/account'

  const navItems = [
    { path: basePath, label: 'OVERVIEW', icon: Home, group: 'show' },
    { path: `${basePath}/episodes`, label: 'PODCASTS', icon: Radio, group: 'show' },
    {
      path: `${basePath}/create-podcast`,
      label: 'CREATE PODCAST',
      icon: PlusCircle,
      group: 'show',
    },
    { path: `${basePath}/analytics`, label: 'ANALYTICS', icon: BarChart3, group: 'tools' },
    { path: `${basePath}/upload`, label: 'UPLOAD', icon: Upload, group: 'tools' },
    { path: `${basePath}/recording`, label: 'RECORD', icon: Mic, group: 'tools' },
    { path: `${basePath}/settings`, label: 'SETTINGS', icon: Settings, group: 'tools' },
  ]

  const isActive = (path: string) => {
    if (path === basePath) {
      return location.pathname === basePath
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <SiteHeader showAuthActions={false} />
      <div className="min-h-screen bg-[#000000] text-[#ffffff]">
        <header className="bg-[#0f0f0f] border-b-4 border-[#C9C16C] shadow-lg">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-[#b0b0b0] tracking-widest">
                  BROADCAST NETWORK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-[#C9C16C] tracking-wide">
                  {podcaster.name.toUpperCase()}
                </p>
                <p className="text-xs text-[#b0b0b0]">{podcaster.podcastName}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-[#C9C16C] overflow-hidden">
                {podcaster.avatar ? (
                  <img
                    src={podcaster.avatar}
                    alt={podcaster.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a]" />
                )}
              </div>
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-[#b0b0b0] hover:text-[#C9C16C] flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex">
          <nav className="w-64 bg-[#0f0f0f] border-r border-[#2a2a2a] min-h-[calc(100vh-88px)]">
            <div className="p-4 space-y-1">
              <p
                className="text-xs text-[#b0b0b0] tracking-widest px-3 py-2"
                style={{ fontFamily: 'monospace' }}
              >
                MY SHOW
              </p>
              {navItems
                .filter((item) => item.group === 'show')
                .map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                        active
                          ? 'bg-[#1a1a1a] text-[#C9C16C]'
                          : 'text-[#b0b0b0] hover:bg-[#1a1a1a] hover:text-[#C9C16C]'
                      }`}
                      style={{ fontFamily: 'system-ui' }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

              <p
                className="text-xs text-[#b0b0b0] tracking-widest px-3 py-2 pt-4"
                style={{ fontFamily: 'monospace' }}
              >
                SESSION TOOLS
              </p>
              {navItems
                .filter((item) => item.group === 'tools')
                .map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                        active
                          ? 'bg-[#1a1a1a] text-[#C9C16C]'
                          : 'text-[#b0b0b0] hover:bg-[#1a1a1a] hover:text-[#C9C16C]'
                      }`}
                      style={{ fontFamily: 'system-ui' }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </nav>

          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
