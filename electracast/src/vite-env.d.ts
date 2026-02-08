/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELECTRACAST_ASSET_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
