import rawCatalog from './podcasts.json'

export type PodcastCatalogEntry = {
  slug: string
  title: string
  summary?: string | null
  cover_image?: string | null
  legacy_url?: string | null
}

type CatalogShape = {
  count: number
  podcasts: PodcastCatalogEntry[]
}

const catalog = rawCatalog as unknown as CatalogShape

export const podcastsCatalog = catalog.podcasts

