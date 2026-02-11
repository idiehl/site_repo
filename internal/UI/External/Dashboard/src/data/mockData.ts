export interface Podcaster {
  id: string;
  name: string;
  podcastName: string;
  avatar: string;
  bio: string;
  subscriberCount: number;
  totalEpisodes: number;
  totalListens: number;
  joinDate: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  listens: number;
  status: 'published' | 'draft' | 'scheduled';
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  episodeTitle: string;
  comment: string;
  timestamp: string;
  rating: number;
}

export interface Ranking {
  rank: number;
  change: number;
  month: string;
  listens: number;
  category: string;
}

export const currentPodcaster: Podcaster = {
  id: '1',
  name: 'Sarah Mitchell',
  podcastName: 'Tech Waves Radio',
  avatar: '',
  bio: 'Exploring the intersection of technology and culture since 2018. Broadcasting weekly insights on innovation, AI, and the future of digital society.',
  subscriberCount: 47823,
  totalEpisodes: 156,
  totalListens: 892456,
  joinDate: '2018-03-15',
};

export const episodes: Episode[] = [
  {
    id: '1',
    title: 'The Future of Distributed Computing',
    description: 'A deep dive into edge computing, cloud infrastructure, and the evolution of distributed systems.',
    duration: '48:32',
    publishDate: '2026-02-08',
    listens: 12456,
    status: 'published',
  },
  {
    id: '2',
    title: 'AI Ethics in 2026: Where Do We Stand?',
    description: 'Examining the current state of AI ethics, regulation, and responsible development practices.',
    duration: '52:18',
    publishDate: '2026-02-01',
    listens: 15892,
    status: 'published',
  },
  {
    id: '3',
    title: 'Quantum Computing Breakthroughs',
    description: 'Recent advances in quantum computing and what they mean for practical applications.',
    duration: '41:05',
    publishDate: '2026-01-25',
    listens: 11234,
    status: 'published',
  },
  {
    id: '4',
    title: 'The Rise of Sustainable Tech',
    description: 'How technology companies are addressing climate change and environmental concerns.',
    duration: '38:47',
    publishDate: '2026-01-18',
    listens: 9876,
    status: 'published',
  },
  {
    id: '5',
    title: 'Cybersecurity in the Modern Age',
    description: 'Understanding current threats and best practices for digital security.',
    duration: '0:00',
    publishDate: '',
    listens: 0,
    status: 'draft',
  },
];

export const analyticsData = {
  weeklyListens: [
    { day: 'Mon', listens: 3420, downloads: 2890 },
    { day: 'Tue', listens: 4120, downloads: 3450 },
    { day: 'Wed', listens: 3890, downloads: 3210 },
    { day: 'Thu', listens: 5230, downloads: 4560 },
    { day: 'Fri', listens: 6780, downloads: 5890 },
    { day: 'Sat', listens: 4320, downloads: 3670 },
    { day: 'Sun', listens: 3890, downloads: 3120 },
  ],
  monthlyGrowth: [
    { month: 'Sep', subscribers: 42100 },
    { month: 'Oct', subscribers: 43500 },
    { month: 'Nov', subscribers: 45200 },
    { month: 'Dec', subscribers: 46100 },
    { month: 'Jan', subscribers: 47100 },
    { month: 'Feb', subscribers: 47823 },
  ],
  demographics: [
    { age: '18-24', percentage: 15 },
    { age: '25-34', percentage: 38 },
    { age: '35-44', percentage: 28 },
    { age: '45-54', percentage: 13 },
    { age: '55+', percentage: 6 },
  ],
};

export const recentComments: Comment[] = [
  {
    id: '1',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    episodeTitle: 'The Future of Distributed Computing',
    comment: 'Incredible insights on edge computing! The way you explained the transition from centralized to distributed systems really clicked for me.',
    timestamp: '2026-02-09T14:23:00',
    rating: 5,
  },
  {
    id: '2',
    userName: 'Maria Santos',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    episodeTitle: 'AI Ethics in 2026: Where Do We Stand?',
    comment: 'Thank you for covering this topic so thoroughly. The discussion on bias in AI systems was especially relevant.',
    timestamp: '2026-02-08T09:45:00',
    rating: 5,
  },
  {
    id: '3',
    userName: 'Jordan Wright',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    episodeTitle: 'Quantum Computing Breakthroughs',
    comment: 'Mind-blowing episode! Never thought quantum computing could be explained so clearly.',
    timestamp: '2026-02-07T16:12:00',
    rating: 5,
  },
  {
    id: '4',
    userName: 'Emma Liu',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    episodeTitle: 'AI Ethics in 2026: Where Do We Stand?',
    comment: 'Would love to hear more about the regulatory frameworks being developed in Europe!',
    timestamp: '2026-02-06T11:30:00',
    rating: 4,
  },
  {
    id: '5',
    userName: 'David Park',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    episodeTitle: 'The Rise of Sustainable Tech',
    comment: 'Great episode as always. The interview with the sustainable tech CEO was fantastic.',
    timestamp: '2026-02-05T19:55:00',
    rating: 5,
  },
];

export const globalRankings: Ranking[] = [
  {
    rank: 24,
    change: 3,
    month: 'Feb 2026',
    listens: 124567,
    category: 'Technology',
  },
  {
    rank: 27,
    change: -2,
    month: 'Jan 2026',
    listens: 118234,
    category: 'Technology',
  },
  {
    rank: 25,
    change: 5,
    month: 'Dec 2025',
    listens: 115890,
    category: 'Technology',
  },
  {
    rank: 30,
    change: 1,
    month: 'Nov 2025',
    listens: 109456,
    category: 'Technology',
  },
  {
    rank: 31,
    change: -3,
    month: 'Oct 2025',
    listens: 106234,
    category: 'Technology',
  },
  {
    rank: 28,
    change: 4,
    month: 'Sep 2025',
    listens: 102890,
    category: 'Technology',
  },
];