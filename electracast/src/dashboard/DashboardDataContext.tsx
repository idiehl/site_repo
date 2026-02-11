import { ReactNode, createContext, useContext } from 'react'
import {
  dashboardDefaults,
  Episode,
  Podcaster,
  Comment,
  Ranking,
} from './data/mockData'

type AnalyticsData = typeof dashboardDefaults.analyticsData

export type DashboardData = {
  podcaster: Podcaster
  episodes: Episode[]
  analyticsData: AnalyticsData
  recentComments: Comment[]
  globalRankings: Ranking[]
}

const DashboardDataContext = createContext<DashboardData>(dashboardDefaults)

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
