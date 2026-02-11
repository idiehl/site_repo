import { TrendingUp, Users, Radio, Headphones, Play, Star, TrendingDown, TrendingUp as TrendingUpIcon, Minus, MessageSquare } from 'lucide-react';
import { currentPodcaster, episodes, analyticsData, recentComments, globalRankings } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Overview() {
  const recentEpisodes = episodes.filter(e => e.status === 'published').slice(0, 3);
  
  const stats = [
    { 
      label: 'TOTAL SUBSCRIBERS', 
      value: currentPodcaster.subscriberCount.toLocaleString(),
      icon: Users,
      trend: '+12.3%',
    },
    { 
      label: 'TOTAL LISTENS', 
      value: currentPodcaster.totalListens.toLocaleString(),
      icon: Headphones,
      trend: '+18.7%',
    },
    { 
      label: 'EPISODES PUBLISHED', 
      value: currentPodcaster.totalEpisodes.toString(),
      icon: Radio,
      trend: '+3',
    },
    { 
      label: 'AVG. ENGAGEMENT', 
      value: '76.4%',
      icon: TrendingUp,
      trend: '+5.2%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-8 rounded-sm shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-sm bg-[#1A2744] border-4 border-[#C89E3E] overflow-hidden flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1655947715189-e7edcae154cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvZGNhc3RlciUyMHN0dWRpb3xlbnwxfHx8fDE3NzA2OTQ2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt={currentPodcaster.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl text-[#D4A94E] tracking-wider mb-2" style={{ fontFamily: 'monospace' }}>
              {currentPodcaster.podcastName.toUpperCase()}
            </h2>
            <p className="text-sm text-[#8A94A6] mb-4 tracking-wide" style={{ fontFamily: 'monospace' }}>
              HOSTED BY: {currentPodcaster.name.toUpperCase()}
            </p>
            <p className="text-[#BCC5D0] leading-relaxed mb-4">
              {currentPodcaster.bio}
            </p>
            <p className="text-xs text-[#8A94A6] tracking-wide" style={{ fontFamily: 'monospace' }}>
              MEMBER SINCE: {new Date(currentPodcaster.joinDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm hover:border-[#C89E3E] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 text-[#C89E3E]" />
                <span className="text-xs text-[#D4A94E] bg-[#070B1A] px-2 py-1 rounded-sm border border-[#1D1B35]" style={{ fontFamily: 'monospace' }}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-[#8A94A6] mb-2 tracking-widest" style={{ fontFamily: 'monospace' }}>
                {stat.label}
              </p>
              <p className="text-3xl text-[#EEFCF1] tracking-wider" style={{ fontFamily: 'monospace' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
        <h3 className="text-xl text-[#D4A94E] mb-6 tracking-wider" style={{ fontFamily: 'monospace' }}>
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
                fontSize: '12px'
              }}
            />
            <Bar dataKey="listens" fill="#C89E3E" />
            <Bar dataKey="downloads" fill="#1A2744" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#C89E3E] border border-[#A8782F]"></div>
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>LISTENS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1A2744] border border-[#1D1B35]"></div>
            <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>DOWNLOADS</span>
          </div>
        </div>
      </div>

      {/* Recent Episodes */}
      <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg text-[#EEFCF1]">
            Episode Pipeline
          </h3>
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
                {/* Play Button */}
                <button className="w-8 h-8 bg-[#1A2744] border border-[#1D1B35] rounded-md flex items-center justify-center hover:bg-[#C89E3E] hover:border-[#C89E3E] transition-all flex-shrink-0 mt-0.5 group-hover:border-[#C89E3E]">
                  <Play className="w-4 h-4 text-[#BCC5D0] ml-0.5" />
                </button>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-[#EEFCF1] text-sm leading-tight">{episode.title}</h4>
                    <span className="text-xs text-[#D4A94E] bg-[#1A2744] px-2 py-1 rounded border border-[#1D1B35] whitespace-nowrap flex-shrink-0">
                      PUBLISHED
                    </span>
                  </div>
                  <p className="text-xs text-[#8A94A6] mb-2 line-clamp-1">{episode.description}</p>
                  <div className="flex items-center gap-4 text-xs text-[#8A94A6]">
                    <span>{new Date(episode.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
        <button className="w-full text-center text-xs text-[#8A94A6] hover:text-[#D4A94E] mt-4 py-2 transition-colors" style={{ fontFamily: 'monospace' }}>
          VIEW CONTENT ARCHIVE →
        </button>
      </div>

      {/* Two Column Layout for Comments and Rankings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Listener Comments Feed */}
        <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-[#C89E3E]" />
            <h3 className="text-lg text-[#EEFCF1]">
              Listener Feedback
            </h3>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm text-[#EEFCF1]">{comment.userName}</h4>
                      <div className="flex items-center gap-0.5">
                        {[...Array(comment.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#D4A94E] text-[#D4A94E]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#8A94A6] mb-2">
                      {new Date(comment.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#BCC5D0] mb-2 leading-relaxed">
                  {comment.comment}
                </p>
                <p className="text-xs text-[#8A94A6] italic truncate">
                  Re: {comment.episodeTitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Rankings */}
        <div className="bg-[#0B1226] border border-[#1D1B35] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUpIcon className="w-5 h-5 text-[#C89E3E]" />
            <h3 className="text-lg text-[#EEFCF1]">
              Global Rankings
            </h3>
          </div>
          <div className="mb-6">
            <div className="bg-[#070B1A] border-2 border-[#C89E3E] p-6 rounded-lg text-center">
              <p className="text-xs text-[#8A94A6] mb-2 tracking-widest" style={{ fontFamily: 'monospace' }}>
                CURRENT RANK - TECHNOLOGY
              </p>
              <p className="text-5xl text-[#D4A94E] mb-2" style={{ fontFamily: 'monospace' }}>
                #{globalRankings[0].rank}
              </p>
              <div className="flex items-center justify-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-[#D4A94E]" />
                <span className="text-sm text-[#D4A94E]" style={{ fontFamily: 'monospace' }}>
                  +{globalRankings[0].change} from last month
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[#8A94A6] tracking-widest px-2 mb-3" style={{ fontFamily: 'monospace' }}>
              MONTHLY HISTORY
            </p>
            {globalRankings.map((ranking, index) => {
              const TrendIcon = ranking.change > 0 ? TrendingUpIcon : ranking.change < 0 ? TrendingDown : Minus;
              const trendColor = ranking.change > 0 ? 'text-[#D4A94E]' : ranking.change < 0 ? 'text-[#8A94A6]' : 'text-[#8A94A6]';
              
              return (
                <div 
                  key={ranking.month}
                  className={`bg-[#070B1A] border border-[#1D1B35] p-3 rounded-lg hover:border-[#C89E3E] transition-all ${index === 0 ? 'border-[#C89E3E]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-[#EEFCF1]" style={{ fontFamily: 'monospace' }}>
                        #{ranking.rank}
                      </span>
                      <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
                        {ranking.month}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${trendColor}`}>
                      <TrendIcon className="w-3 h-3" />
                      <span className="text-xs" style={{ fontFamily: 'monospace' }}>
                        {ranking.change > 0 ? '+' : ''}{ranking.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#8A94A6]">
                    {ranking.listens.toLocaleString()} listens
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}