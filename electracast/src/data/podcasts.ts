import { podcastsCatalog } from './catalog/podcastsCatalog'

export type Podcast = {
  title: string
  label: string
  to?: string
  href?: string
  image?: string
  summary?: string
}

export const podcastDirectory: Podcast[] = podcastsCatalog.map((p) => ({
  title: p.title,
  label: 'ElectraCast Podcast',
  to: `/podcast/${p.slug}`,
  href: p.legacy_url ?? `https://electracast.com/podcast/${p.slug}/`,
  image: p.cover_image ?? undefined,
  summary: p.summary ?? undefined,
}))

const featuredSlugs = [
  'the-last-saturday-night',
  'techtalk-revolution',
  'nightmare-road-stories',
  'unapologetically-fab',
]

export const featuredPodcasts: Podcast[] = featuredSlugs
  .map((slug) => podcastsCatalog.find((p) => p.slug === slug))
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map((p) => ({
    title: p.title,
    label: 'Featured',
    to: `/podcast/${p.slug}`,
    href: p.legacy_url ?? `https://electracast.com/podcast/${p.slug}/`,
    image: p.cover_image ?? undefined,
    summary: p.summary ?? undefined,
  }))
