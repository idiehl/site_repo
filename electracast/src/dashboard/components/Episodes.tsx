import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Pause,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Headphones,
} from 'lucide-react'
import { useDashboardData } from '../DashboardDataContext'

export const Episodes = () => {
  const { episodes, podcasts } = useDashboardData()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>(
    'all'
  )
  const [playingId, setPlayingId] = useState<string | null>(null)

  const filteredEpisodes =
    filter === 'all' ? episodes : episodes.filter((episode) => episode.status === filter)
  const displayEpisodes = podcasts.length ? filteredEpisodes : []

  const statusColors = {
    published: 'text-[#D4A94E] border-[#C89E3E]',
    draft: 'text-[#8A94A6] border-[#8A94A6]',
    scheduled: 'text-[#E8C97A] border-[#E8C97A]',
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2
          className="text-3xl text-[#D4A94E] tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          PODCAST LIBRARY
        </h2>
        <Link
          to="/account/create"
          className="px-6 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          + NEW PODCAST
        </Link>
      </div>

      <div className="flex gap-4">
        {(['all', 'published', 'draft', 'scheduled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 border-2 rounded-sm tracking-wider text-sm transition-all ${
              filter === status
                ? 'bg-[#C89E3E] border-[#D4A94E] text-[#070B1A]'
                : 'bg-[#0B1226] border-[#1D1B35] text-[#8A94A6] hover:border-[#C89E3E]'
            }`}
            style={{ fontFamily: 'monospace' }}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {displayEpisodes.length ? (
          displayEpisodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm hover:border-[#C89E3E] transition-all"
            >
              <div className="flex gap-6">
                <button
                  onClick={() =>
                    setPlayingId(playingId === episode.id ? null : episode.id)
                  }
                  className="w-16 h-16 bg-[#C89E3E] border-2 border-[#D4A94E] rounded-sm flex items-center justify-center hover:bg-[#D4A94E] transition-all flex-shrink-0"
                  disabled={episode.status === 'draft'}
                >
                  {playingId === episode.id ? (
                    <Pause className="w-8 h-8 text-[#070B1A]" />
                  ) : (
                    <Play className="w-8 h-8 text-[#070B1A] ml-1" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl text-[#EEFCF1] tracking-wide">
                      {episode.title}
                    </h3>
                    <span
                      className={`text-xs px-3 py-1 border rounded-sm ${
                        statusColors[episode.status]
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {episode.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#8A94A6] mb-4">{episode.description}</p>
                  <div className="flex items-center gap-6 text-sm text-[#8A94A6]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {episode.publishDate
                        ? new Date(episode.publishDate).toLocaleDateString()
                        : 'TBD'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {episode.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      {episode.listens.toLocaleString()} listens
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-[#8A94A6] hover:text-[#C89E3E] transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[#8A94A6] hover:text-[#E57373] transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm text-sm text-[#8A94A6]">
            No podcasts yet. Use the Create Podcast menu item to submit your first show.
          </div>
        )}
      </div>
    </div>
  )
}
