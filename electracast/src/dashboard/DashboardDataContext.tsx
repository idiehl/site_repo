import { ReactNode, createContext, useContext } from 'react'
import type { ElectraCastAccount, ElectraCastPodcast } from '../lib/api'
import { dashboardDefaults, Episode, Podcaster, Submission } from './data/mockData'

type AnalyticsData = typeof dashboardDefaults.analyticsData

export type DashboardData = {
  podcaster: Podcaster
  episodes: Episode[]
  analyticsData: AnalyticsData
  recentSubmissions: Submission[]
  account: ElectraCastAccount | null
  podcasts: ElectraCastPodcast[]
  authToken: string | null
  addPodcast: (podcast: ElectraCastPodcast) => void
}

const defaultDashboardData: DashboardData = {
  ...dashboardDefaults,
  account: null,
  podcasts: [],
  authToken: null,
  addPodcast: () => {},
}

const DashboardDataContext = createContext<DashboardData>(defaultDashboardData)

export const DashboardDataProvider = ({
  value,
  children,
}: {
  value: DashboardData
  children: ReactNode
}) => {
  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export const useDashboardData = () => useContext(DashboardDataContext)
