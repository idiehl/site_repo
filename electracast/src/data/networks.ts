import { networksCatalog } from './catalog/networksCatalog'

export type Network = {
  title: string
  slug: string
  to: string
  legacyUrl: string
  image?: string
  description?: string
  podcastSlugs?: string[]
}

export const networkDirectory: Network[] = networksCatalog.map((n) => ({
  title: n.title,
  slug: n.slug,
  to: `/network/${n.slug}`,
  legacyUrl: n.legacy_url ?? `https://electracast.com/network/${n.slug}/`,
  image: n.cover_image ?? undefined,
  description: n.description ?? undefined,
  podcastSlugs: n.podcast_slugs ?? [],
}))
