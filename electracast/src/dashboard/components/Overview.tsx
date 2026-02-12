import {
  TrendingUp,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  MessageSquare,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDashboardData } from '../DashboardDataContext'

export const Overview = () => {
  const { podcaster, episodes, podcasts, analyticsData, recentSubmissions } =
    useDashboardData()

  const sortedEpisodes = [...episodes].sort((a, b) => {
    const aTime = new Date(a.publishDate).getTime() || 0
    const bTime = new Date(b.publishDate).getTime() || 0
    return bTime - aTime
  })
  const recentEpisodes = sortedEpisodes.slice(0, 3)
  const publishedCount = episodes.filter((episode) => episode.status === 'published')
    .length
  const scheduledCount = episodes.filter((episode) => episode.status === 'scheduled')
    .length
  const totalPodcasts = podcasts.length || podcaster.totalEpisodes
  const pendingCount = podcasts.filter((podcast) => podcast.status === 'pending').length
  const syncedCount = podcasts.filter((podcast) =>
    ['synced', 'imported'].includes(podcast.status)
  ).length
  const errorCount = podcasts.filter((podcast) => podcast.sync_error).length

  const stats = [
    {
      label: 'TOTAL PODCASTS',
      value: totalPodcasts.toString(),
      icon: Radio,
      trend: `${syncedCount} synced`,
    },
    {
      label: 'PENDING REVIEW',
      value: pendingCount.toString(),
      icon: Clock,
      trend: pendingCount ? 'AWAITING' : 'CLEAR',
    },
    {
      label: 'SYNCED TO MEGAPHONE',
      value: syncedCount.toString(),
      icon: CheckCircle2,
      trend: syncedCount ? 'ACTIVE' : 'NEW',
    },
    {
      label: 'SYNC ERRORS',
      value: errorCount.toString(),
      icon: AlertTriangle,
      trend: errorCount ? 'ACTION' : 'CLEAR',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-8 rounded-sm shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-sm bg-[#1a1a1a] border-4 border-[#C9C16C] overflow-hidden flex-shrink-0">
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
          <div className="flex-1">
            <h2
              className="text-3xl text-[#C9C16C] tracking-wider mb-2"
              style={{ fontFamily: 'monospace' }}
            >
              {podcaster.podcastName.toUpperCase()}
            </h2>
            <p
              className="text-sm text-[#b0b0b0] mb-4 tracking-wide"
              style={{ fontFamily: 'monospace' }}
            >
              HOSTED BY: {podcaster.name.toUpperCase()}
            </p>
            <p className="text-[#ffffff] leading-relaxed mb-4">{podcaster.bio}</p>
            <p
              className="text-xs text-[#b0b0b0] tracking-wide"
              style={{ fontFamily: 'monospace' }}
            >
              MEMBER SINCE:{' '}
              {new Date(podcaster.joinDate)
                .toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                .toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-[#0f0f0f] border-2 border-[#2a2a2a] p-6 rounded-sm hover:border-[#C9C16C] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-[#C9C16C]" />
                <span
                  className="text-xs text-[#C9C16C] bg-[#000000] px-2 py-1 rounded-sm border border-[#2a2a2a]"
                  style={{ fontFamily: 'monospace' }}
                >
                  {stat.trend}
                </span>
              </div>
              <p
                className="text-xs text-[#b0b0b0] mb-2 tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                {stat.label}
              </p>
              <p
                className="text-3xl text-[#ffffff] tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
        <h3
          className="text-xl text-[#C9C16C] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          WEEKLY SUBMISSIONS
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="day"
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000000',
                border: '2px solid #C9C16C',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="submitted" fill="#C9C16C" />
            <Bar dataKey="synced" fill="#A89D4C" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#C9C16C] border border-[#A89D4C]" />
            <span className="text-xs text-[#b0b0b0]" style={{ fontFamily: 'monospace' }}>
              SUBMISSIONS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1a1a1a] border border-[#2a2a2a]" />
            <span className="text-xs text-[#b0b0b0]" style={{ fontFamily: 'monospace' }}>
              SYNCED
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg text-[#ffffff]">Episode Pipeline</h3>
          <span className="text-xs text-[#b0b0b0]" style={{ fontFamily: 'monospace' }}>
            {publishedCount} SYNCED • {scheduledCount} PENDING
          </span>
        </div>
        <div className="space-y-3">
          {recentEpisodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-[#000000] border border-[#2a2a2a] p-4 rounded-lg hover:border-[#C9C16C] transition-all group"
            >
              <div className="flex items-start gap-4">
                <button className="w-8 h-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md flex items-center justify-center hover:bg-[#C9C16C] hover:border-[#C9C16C] transition-all flex-shrink-0 mt-0.5 group-hover:border-[#C9C16C]">
                  <Play className="w-4 h-4 text-[#ffffff] ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-[#ffffff] text-sm leading-tight">
                      {episode.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded border whitespace-nowrap flex-shrink-0 ${
                        episode.status === 'published'
                          ? 'text-[#C9C16C] bg-[#1a1a1a] border-[#2a2a2a]'
                          : episode.status === 'scheduled'
                          ? 'text-[#A89D4C] bg-[#1a1a1a] border-[#2a2a2a]'
                          : 'text-[#E57373] bg-[#1a1a1a] border-[#2a2a2a]'
                      }`}
                    >
                      {episode.status === 'published'
                        ? 'SYNCED'
                        : episode.status === 'scheduled'
                        ? 'PENDING'
                        : 'NEEDS ATTN'}
                    </span>
                  </div>
                  <p className="text-xs text-[#b0b0b0] mb-2 line-clamp-1">
                    {episode.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#b0b0b0]">
                    <span>
                      {episode.publishDate
                        ? new Date(episode.publishDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'TBD'}
                    </span>
                    <span>{episode.duration}</span>
                    <span>{episode.listens.toLocaleString()} listens</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-[#C9C16C]" />
            <h3 className="text-lg text-[#ffffff]">Recent Submissions</h3>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-[#000000] border border-[#2a2a2a] p-4 rounded-lg hover:border-[#C9C16C] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[#ffffff] text-sm">{submission.title}</p>
                    <p className="text-xs text-[#b0b0b0] line-clamp-1">
                      {submission.summary}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      submission.status === 'synced'
                        ? 'text-[#C9C16C] border-[#C9C16C]'
                        : submission.status === 'pending'
                        ? 'text-[#A89D4C] border-[#A89D4C]'
                        : submission.status === 'failed'
                        ? 'text-[#E57373] border-[#E57373]'
                        : 'text-[#b0b0b0] border-[#b0b0b0]'
                    }`}
                  >
                    {submission.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#b0b0b0]">
                  Submitted{' '}
                  {new Date(submission.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-[#C9C16C]" />
            <h3 className="text-lg text-[#ffffff]">Status Breakdown</h3>
          </div>

          <div className="space-y-4">
            {analyticsData.statusBreakdown.map((status) => (
              <div
                key={status.label}
                className="bg-[#000000] border border-[#2a2a2a] p-4 rounded-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#C9C16C] font-bold">{status.label}</span>
                    <span className="text-xs text-[#b0b0b0] ml-2">
                      {status.count} podcasts
                    </span>
                  </div>
                  <div className="text-xs text-[#b0b0b0]">{status.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
