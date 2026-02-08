const fallbackBase = '/electracast-assets'

export const getAssetUrl = (relativePath: string) => {
  const rawBase = import.meta.env.VITE_ELECTRACAST_ASSET_BASE || fallbackBase
  const base = rawBase.replace(/\/+$/, '')
  const cleanedPath = relativePath.replace(/^\/+/, '')

  return `${base}/${cleanedPath}`
}
