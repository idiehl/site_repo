import {
  TrendingUp,
  Users,
  Radio,
  Headphones,
  Play,
  Star,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Minus,
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
  const { podcaster, episodes, analyticsData, recentComments, globalRankings } =
    useDashboardData()
  const recentEpisodes = episodes
    .filter((episode) => episode.status === 'published')
    .slice(0, 3)

  const stats = [
    {
      label: 'TOTAL SUBSCRIBERS',
      value: podcaster.subscriberCount.toLocaleString(),
      icon: Users,
      trend: '+12.3%',
    },
    {
      label: 'TOTAL LISTENS',
      value: podcaster.totalListens.toLocaleString(),
      icon: Headphones,
      trend: '+18.7%',
    },
    {
      label: 'EPISODES PUBLISHED',
      value: podcaster.totalEpisodes.toString(),
      icon: Radio,
      trend: '+3',
    },
    {
      label: 'AVG. ENGAGEMENT',
      value: '76.4%',
      icon: TrendingUp,
      trend: '+5.2%',
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
          WEEKLY ACTIVITY
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.weeklyListens}>
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
            <Bar dataKey="listens" fill="#C89E3E" />
            <Bar dataKey="downloads" fill="#1A2744" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#C89E3E] border border-[#A8782F]" />
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
              LISTENS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1A2744] border border-[#1D1B35]" />
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
              DOWNLOADS
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg text-[#EEFCF1]">Episode Pipeline</h3>
          <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
            {recentEpisodes.length} PUBLISHED • 2 IN STAGING
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
                    <span className="text-xs text-[#D4A94E] bg-[#1A2744] px-2 py-1 rounded border border-[#1D1B35] whitespace-nowrap flex-shrink-0">
                      PUBLISHED
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
                    <span>•</span>
                    <span>{episode.duration}</span>
                    <span>•</span>
                    <span>{episode.listens.toLocaleString()} listens</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full text-center text-xs text-[#8A94A6] hover:text-[#D4A94E] mt-4 py-2 transition-colors"
          style={{ fontFamily: 'monospace' }}
        >
          VIEW CONTENT ARCHIVE →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-[#C89E3E]" />
            <h3 className="text-lg text-[#EEFCF1]">Listener Feedback</h3>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {recentComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-lg hover:border-[#C89E3E] transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A2744] border border-[#1D1B35] overflow-hidden flex-shrink-0">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#EEFCF1] text-sm">{comment.userName}</p>
                        <p className="text-xs text-[#8A94A6]">{comment.episodeTitle}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3 h-3 ${
                              index < comment.rating ? 'text-[#C89E3E]' : 'text-[#1D1B35]'
                            }`}
                            fill={index < comment.rating ? '#C89E3E' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#BCC5D0] leading-relaxed mb-2">
                  {comment.comment}
                </p>
                <p className="text-xs text-[#8A94A6]">
                  {new Date(comment.timestamp).toLocaleDateString('en-US', {
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
            <h3 className="text-lg text-[#EEFCF1]">Global Rankings</h3>
          </div>

          <div className="bg-[#070B1A] border-2 border-[#1D1B35] p-6 rounded-sm mb-6">
            <p className="text-xs text-[#8A94A6] mb-2 tracking-widest">
              CURRENT RANK • TECHNOLOGY
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-[#D4A94E] font-bold">
                #{globalRankings[0]?.rank ?? 0}
              </span>
              <div className="flex items-center gap-1 text-[#C89E3E]">
                <TrendingUpIcon className="w-4 h-4" />
                <span className="text-sm">
                  +{globalRankings[0]?.change ?? 0} from last month
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm text-[#8A94A6] tracking-widest">MONTHLY HISTORY</h4>
            {globalRankings.map((ranking) => (
              <div
                key={ranking.month}
                className="bg-[#070B1A] border border-[#1D1B35] p-4 rounded-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[#D4A94E] font-bold">#{ranking.rank}</span>
                    <span className="text-xs text-[#8A94A6] ml-2">
                      {ranking.month}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {ranking.change > 0 ? (
                      <TrendingUpIcon className="w-3 h-3 text-[#C89E3E]" />
                    ) : ranking.change < 0 ? (
                      <TrendingDown className="w-3 h-3 text-[#E57373]" />
                    ) : (
                      <Minus className="w-3 h-3 text-[#8A94A6]" />
                    )}
                    <span
                      className={`text-xs ${
                        ranking.change > 0
                          ? 'text-[#C89E3E]'
                          : ranking.change < 0
                          ? 'text-[#E57373]'
                          : 'text-[#8A94A6]'
                      }`}
                    >
                      {ranking.change > 0 ? '+' : ''}
                      {ranking.change}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#8A94A6]">
                  {ranking.listens.toLocaleString()} listens
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
