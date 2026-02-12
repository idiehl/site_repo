import rawCatalog from './networks.json'

export type NetworkCatalogEntry = {
  slug: string
  title: string
  description?: string | null
  cover_image?: string | null
  legacy_url?: string | null
  podcast_slugs?: string[]
}

type CatalogShape = {
  count: number
  networks: NetworkCatalogEntry[]
}

const catalog = rawCatalog as unknown as CatalogShape

export const networksCatalog = catalog.networks

