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
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-sm bg-[#1A2744] border-4 border-[#C89E3E] overflow-hidden flex-shrink-0">
            {podcaster.avatar ? (
              <img
                src={podcaster.avatar}
                alt={podcaster.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1A2744]" />
            )}
          </div>
          <div className="flex-1">
            <h2
              className="text-3xl text-[#D4A94E] tracking-wider mb-2"
              style={{ fontFamily: 'monospace' }}
            >
              {podcaster.podcastName.toUpperCase()}
            </h2>
            <p
              className="text-sm text-[#8A94A6] mb-4 tracking-wide"
              style={{ fontFamily: 'monospace' }}
            >
              HOSTED BY: {podcaster.name.toUpperCase()}
            </p>
            <p className="text-[#BCC5D0] leading-relaxed mb-4">{podcaster.bio}</p>
            <p
              className="text-xs text-[#8A94A6] tracking-wide"
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
              className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm hover:border-[#C89E3E] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-[#C89E3E]" />
                <span
                  className="text-xs text-[#D4A94E] bg-[#070B1A] px-2 py-1 rounded-sm border border-[#1D1B35]"
                  style={{ fontFamily: 'monospace' }}
                >
                  {stat.trend}
                </span>
              </div>
              <p
                className="text-xs text-[#8A94A6] mb-2 tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                {stat.label}
              </p>
              <p
                className="text-3xl text-[#EEFCF1] tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
        <h3
          className="text-xl text-[#D4A94E] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          WEEKLY SUBMISSIONS
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D1B35" />
            <XAxis
              dataKey="day"
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070B1A',
                border: '2px solid #C89E3E',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="submitted" fill="#C89E3E" />
            <Bar dataKey="synced" fill="#1A2744" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#C89E3E] border border-[#A8782F]" />
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
              SUBMISSIONS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1A2744] border border-[#1D1B35]" />
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
              SYNCED
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg text-[#EEFCF1]">Episode Pipeline</h3>
          <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
            {publishedCount} SYNCED • {scheduledCount} PENDING
          </span>
        </div>
        <div className="space-y-3">
          {recentEpisodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-lg hover:border-[#C89E3E] transition-all group"
            >
              <div className="flex items-start gap-4">
                <button className="w-8 h-8 bg-[#1A2744] border border-[#1D1B35] rounded-md flex items-center justify-center hover:bg-[#C89E3E] hover:border-[#C89E3E] transition-all flex-shrink-0 mt-0.5 group-hover:border-[#C89E3E]">
                  <Play className="w-4 h-4 text-[#BCC5D0] ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-[#EEFCF1] text-sm leading-tight">
                      {episode.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded border whitespace-nowrap flex-shrink-0 ${
                        episode.status === 'published'
                          ? 'text-[#D4A94E] bg-[#1A2744] border-[#1D1B35]'
                          : episode.status === 'scheduled'
                          ? 'text-[#E8C97A] bg-[#1A2744] border-[#1D1B35]'
                          : 'text-[#E57373] bg-[#1A2744] border-[#1D1B35]'
                      }`}
                    >
                      {episode.status === 'published'
                        ? 'SYNCED'
                        : episode.status === 'scheduled'
                        ? 'PENDING'
                        : 'NEEDS ATTN'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A94A6] mb-2 line-clamp-1">
                    {episode.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#8A94A6]">
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
        <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-[#C89E3E]" />
            <h3 className="text-lg text-[#EEFCF1]">Recent Submissions</h3>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-lg hover:border-[#C89E3E] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[#EEFCF1] text-sm">{submission.title}</p>
                    <p className="text-xs text-[#8A94A6] line-clamp-1">
                      {submission.summary}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      submission.status === 'synced'
                        ? 'text-[#D4A94E] border-[#C89E3E]'
                        : submission.status === 'pending'
                        ? 'text-[#E8C97A] border-[#E8C97A]'
                        : submission.status === 'failed'
                        ? 'text-[#E57373] border-[#E57373]'
                        : 'text-[#8A94A6] border-[#8A94A6]'
                    }`}
                  >
                    {submission.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#8A94A6]">
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

        <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-[#C89E3E]" />
            <h3 className="text-lg text-[#EEFCF1]">Status Breakdown</h3>
          </div>

          <div className="space-y-4">
            {analyticsData.statusBreakdown.map((status) => (
              <div
                key={status.label}
                className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#D4A94E] font-bold">{status.label}</span>
                    <span className="text-xs text-[#8A94A6] ml-2">
                      {status.count} podcasts
                    </span>
                  </div>
                  <div className="text-xs text-[#8A94A6]">{status.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
