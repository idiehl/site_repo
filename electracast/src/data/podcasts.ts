export type Podcast = {
  title: string
  label: string
  href?: string
  image?: string
}

const slugToTitle = (slug: string) => {
  return slug
    .split('-')
    .map((part) => (part.length ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ')
    .replace(/\bW\b/g, 'w/')
}

const podcastSlugs = [
  '50-years-of-music-w-50-year-old-white-guys',
  'abundance-blueprint-with-kimberly',
  'abracadabra-create-what-you-speak',
  'adventures-to-wisdom',
  'airquote-law-pod',
  'asked-and-answered-by-soul',
  'athletic-obscura',
  'avhd',
  'behind-the-rock-with-dc',
  'being-your-own-superstar',
  'big-truth-encouragement',
  'bodacious-minds',
  'brain-arcade',
  'brilliant-marketing-with-mary',
  'business-kare-with-kerstin',
  'career-advancement-with-craig-ancel',
  'cinematic-revelations',
  'congresssional-record-daily-digest',
  'creators-getting-paid',
  'crypto-with-kamal',
  'cosmic-love-antenna',
  'deep-leadership',
  'dollar-betz',
  'e2-entrepreneurs-exposed',
  'eazy-does-it-podcast',
  'electracast-behind-the-scenes',
  'eye-am-everything',
  'generation-film',
  'get-real-with-dr-ronaye',
  'ghost-hampton',
  'healthy-delicious-lifestyle-with-claudine',
  'her-extraordinary-life-by-design',
  'how-to-sell-show',
  'humanized-with-blue-telusma',
  'infuse-compassion-podcast',
  'lets-talk-soul',
  'lessons-from-the-fast-lane-with-peter-rafelson',
  'medicine-in-america',
  'missing-the-point',
  'music-medicine',
  'nasa-daily',
  'nightmare-road-stories',
  'no-judgement-podcast',
  'or-whatever-movies',
  'page-turners-studio-with-cori',
  'permission-to-live',
  'polly-campbell-simply-said',
  'poetics-of-place',
  'power-suits-pillow-talk',
  'psychic-visions-podcast',
  'pure-truth',
  'red-white-and-buddha',
  'ringside-with-ray-prince',
  'sales-is-easy',
  'sideline-sports',
  'simply-write-w-polly',
  'spiritually-restored',
  'starfleet-leadership-academy',
  'steps-to-feel-good-daily-with-lona',
  'swe-spotlight-with-joie',
  'synclove',
  'techtalk-revolution',
  'terra-nova',
  'the-barry-bonkers-show',
  'the-box-god-dare-to-believe',
  'the-c-word',
  'the-candlepower-hour',
  'the-curse-of-the-lake-house',
  'the-ethical-evolution-podcast',
  'the-geo-godfather-wars',
  'the-last-saturday-night',
  'the-lawrence-ross-show',
  'the-marketing-mirror',
  'the-neighborhood-podcast',
  'the-naturebacked-podcast',
  'the-patrick-bass-show',
  'the-purpose-effect',
  'the-responsible-leadership-podcast',
  'the-social-psychic-radio-show',
  'the-toekenz-podcast',
  'think-business-with-tyler',
  'transforming-45',
  'tru-talks-about-theater',
  'tune-into-sound-wellbeing',
  'unapologetically-fab',
  'who-the-f-is-roger-smith',
  'wine-wisdom',
  'won-a-bet',
]

export const podcastDirectory: Podcast[] = podcastSlugs.map((slug) => ({
  title: slugToTitle(slug),
  label: 'ElectraCast Podcast',
  href: `https://electracast.com/podcast/${slug}`,
}))

export const featuredPodcasts: Podcast[] = [
  {
    title: 'The Last Saturday Night',
    label: 'ElectraCast Original',
    href: 'https://electracast.com/podcast/the-last-saturday-night',
  },
  {
    title: 'TechTalk Revolution',
    label: 'ElectraCast Original',
    href: 'https://electracast.com/podcast/techtalk-revolution',
  },
  {
    title: 'Nightmare Road Stories',
    label: 'ElectraCast Original',
    href: 'https://electracast.com/podcast/nightmare-road-stories',
  },
  {
    title: 'Unapologetically Fab',
    label: 'Network Favorite',
    href: 'https://electracast.com/podcast/unapologetically-fab',
  },
]
