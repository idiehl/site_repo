export interface Podcaster {
  id: string
  name: string
  podcastName: string
  avatar: string
  bio: string
  subscriberCount: number
  totalEpisodes: number
  totalListens: number
  joinDate: string
}

export interface Episode {
  id: string
  title: string
  description: string
  duration: string
  publishDate: string
  listens: number
  status: 'published' | 'draft' | 'scheduled'
}

export interface Submission {
  id: string
  title: string
  summary: string
  status: 'synced' | 'pending' | 'failed' | 'draft'
  createdAt: string
}

export interface StatusBreakdown {
  label: string
  count: number
  percentage: number
}

export const currentPodcaster: Podcaster = {
  id: '1',
  name: 'Sarah Mitchell',
  podcastName: 'Tech Waves Radio',
  avatar: '',
  bio:
    'Exploring the intersection of technology and culture since 2018. Broadcasting weekly insights on innovation, AI, and the future of digital society.',
  subscriberCount: 47823,
  totalEpisodes: 156,
  totalListens: 892456,
  joinDate: '2018-03-15',
}

export const episodes: Episode[] = [
  {
    id: '1',
    title: 'The Future of Distributed Computing',
    description:
      'A deep dive into edge computing, cloud infrastructure, and the evolution of distributed systems.',
    duration: '48:32',
    publishDate: '2026-02-08',
    listens: 12456,
    status: 'published',
  },
  {
    id: '2',
    title: 'AI Ethics in 2026: Where Do We Stand?',
    description:
      'Examining the current state of AI ethics, regulation, and responsible development practices.',
    duration: '52:18',
    publishDate: '2026-02-01',
    listens: 15892,
    status: 'published',
  },
  {
    id: '3',
    title: 'Quantum Computing Breakthroughs',
    description:
      'Recent advances in quantum computing and what they mean for practical applications.',
    duration: '41:05',
    publishDate: '2026-01-25',
    listens: 11234,
    status: 'published',
  },
  {
    id: '4',
    title: 'The Rise of Sustainable Tech',
    description:
      'How technology companies are addressing climate change and environmental concerns.',
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
]

export const analyticsData = {
  weeklyActivity: [
    { day: 'Mon', submitted: 6, synced: 4 },
    { day: 'Tue', submitted: 5, synced: 3 },
    { day: 'Wed', submitted: 7, synced: 5 },
    { day: 'Thu', submitted: 4, synced: 2 },
    { day: 'Fri', submitted: 8, synced: 6 },
    { day: 'Sat', submitted: 3, synced: 2 },
    { day: 'Sun', submitted: 2, synced: 1 },
  ],
  monthlySubmissions: [
    { month: 'Sep', submissions: 12 },
    { month: 'Oct', submissions: 15 },
    { month: 'Nov', submissions: 14 },
    { month: 'Dec', submissions: 18 },
    { month: 'Jan', submissions: 21 },
    { month: 'Feb', submissions: 16 },
  ],
  statusBreakdown: [
    { label: 'Synced', count: 18, percentage: 60 },
    { label: 'Pending', count: 7, percentage: 23 },
    { label: 'Failed', count: 3, percentage: 10 },
    { label: 'Draft', count: 2, percentage: 7 },
  ],
  topCategories: [
    { category: 'Technology', count: 9 },
    { category: 'Business', count: 7 },
    { category: 'Society & Culture', count: 5 },
    { category: 'Arts', count: 4 },
    { category: 'News', count: 3 },
  ],
  hourlySubmissions: [
    { hour: '00:00', submissions: 1 },
    { hour: '03:00', submissions: 2 },
    { hour: '06:00', submissions: 4 },
    { hour: '09:00', submissions: 7 },
    { hour: '12:00', submissions: 6 },
    { hour: '15:00', submissions: 5 },
    { hour: '18:00', submissions: 3 },
    { hour: '21:00', submissions: 2 },
  ],
}

export const recentSubmissions: Submission[] = [
  {
    id: '1',
    title: 'The Future of Distributed Computing',
    summary:
      'A deep dive into edge computing, cloud infrastructure, and the evolution of distributed systems.',
    status: 'synced',
    createdAt: '2026-02-09T14:23:00',
  },
  {
    id: '2',
    title: 'AI Ethics in 2026: Where Do We Stand?',
    summary:
      'Examining the current state of AI ethics, regulation, and responsible development practices.',
    status: 'synced',
    createdAt: '2026-02-08T09:45:00',
  },
  {
    id: '3',
    title: 'Quantum Computing Breakthroughs',
    summary: 'Recent advances in quantum computing and what they mean for practical applications.',
    status: 'pending',
    createdAt: '2026-02-07T16:12:00',
  },
  {
    id: '4',
    title: 'The Rise of Sustainable Tech',
    summary: 'How technology companies are addressing climate change and environmental concerns.',
    status: 'failed',
    createdAt: '2026-02-06T11:30:00',
  },
  {
    id: '5',
    title: 'Cybersecurity in the Modern Age',
    summary: 'Understanding current threats and best practices for digital security.',
    status: 'draft',
    createdAt: '2026-02-05T19:55:00',
  },
]

export const dashboardDefaults = {
  podcaster: currentPodcaster,
  episodes,
  analyticsData,
  recentSubmissions,
}
