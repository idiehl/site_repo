import { useState } from 'react';
import { Play, Pause, Edit, Trash2, Calendar, Clock, Headphones } from 'lucide-react';
import { episodes } from '../data/mockData';

export function Episodes() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredEpisodes = filter === 'all' 
    ? episodes 
    : episodes.filter(e => e.status === filter);

  const statusColors = {
    published: 'text-[#D4A94E] border-[#C89E3E]',
    draft: 'text-[#8A94A6] border-[#8A94A6]',
    scheduled: 'text-[#E8C97A] border-[#E8C97A]',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl text-[#D4A94E] tracking-wider" style={{ fontFamily: 'monospace' }}>
          EPISODE LIBRARY
        </h2>
        <button className="px-6 py-3 bg-[#C89E3E] text-[#070B1A] border-2 border-[#D4A94E] hover:bg-[#D4A94E] transition-all tracking-wider" style={{ fontFamily: 'monospace' }}>
          + NEW EPISODE
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        {(['all', 'published', 'draft', 'scheduled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`
              px-4 py-2 border-2 rounded-sm tracking-wider text-sm transition-all
              ${filter === status 
                ? 'bg-[#C89E3E] border-[#D4A94E] text-[#070B1A]' 
                : 'bg-[#0B1226] border-[#1D1B35] text-[#8A94A6] hover:border-[#C89E3E]'
              }
            `}
            style={{ fontFamily: 'monospace' }}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {filteredEpisodes.map((episode) => (
          <div 
            key={episode.id}
            className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm hover:border-[#C89E3E] transition-all"
          >
            <div className="flex gap-6">
              {/* Play Button */}
              <button 
                onClick={() => setPlayingId(playingId === episode.id ? null : episode.id)}
                className="w-16 h-16 bg-[#C89E3E] border-2 border-[#D4A94E] rounded-sm flex items-center justify-center hover:bg-[#D4A94E] transition-all flex-shrink-0"
                disabled={episode.status === 'draft'}
              >
                {playingId === episode.id ? (
                  <Pause className="w-8 h-8 text-[#070B1A]" />
                ) : (
                  <Play className="w-8 h-8 text-[#070B1A] ml-1" />
                )}
              </button>

              {/* Episode Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl text-[#EEFCF1] tracking-wide">{episode.title}</h3>
                  <span 
                    className={`text-xs px-3 py-1 border rounded-sm ${statusColors[episode.status]}`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {episode.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[#BCC5D0] mb-4">{episode.description}</p>
                
                <div className="flex items-center gap-8 text-sm text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>
                  {episode.publishDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(episode.publishDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {episode.duration !== '0:00' && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{episode.duration}</span>
                    </div>
                  )}
                  {episode.listens > 0 && (
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      <span>{episode.listens.toLocaleString()} LISTENS</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button className="p-2 border-2 border-[#1D1B35] hover:border-[#C89E3E] hover:text-[#C89E3E] transition-all rounded-sm">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 border-2 border-[#1D1B35] hover:border-[#9c4242] hover:text-[#9c4242] transition-all rounded-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Playback Progress (when playing) */}
            {playingId === episode.id && (
              <div className="mt-4 pt-4 border-t-2 border-[#1D1B35]">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>1:24</span>
                  <div className="flex-1 h-2 bg-[#070B1A] border border-[#1D1B35] rounded-sm overflow-hidden">
                    <div className="h-full w-1/3 bg-[#C89E3E]"></div>
                  </div>
                  <span className="text-xs text-[#8A94A6]" style={{ fontFamily: 'monospace' }}>{episode.duration}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEpisodes.length === 0 && (
        <div className="text-center py-16 bg-[#0B1226] border-2 border-[#1D1B35] rounded-sm">
          <p className="text-[#8A94A6] tracking-wider" style={{ fontFamily: 'monospace' }}>
            NO EPISODES FOUND
          </p>
        </div>
      )}
    </div>
  );
}