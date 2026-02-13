export type AdvertiserLogo = {
  name: string
  // Planned: move to tracked `electracast/public/advertiser-logos/*` assets.
  imageSrc?: string
}

// Placeholder set until we curate/track actual brand assets.
export const advertiserLogosLeft: AdvertiserLogo[] = [
  { name: 'Advertiser Logo 1' },
  { name: 'Advertiser Logo 2' },
  { name: 'Advertiser Logo 3' },
  { name: 'Advertiser Logo 4' },
  { name: 'Advertiser Logo 5' },
]

export const advertiserLogosRight: AdvertiserLogo[] = [
  { name: 'Advertiser Logo 6' },
  { name: 'Advertiser Logo 7' },
  { name: 'Advertiser Logo 8' },
  { name: 'Advertiser Logo 9' },
  { name: 'Advertiser Logo 10' },
]

