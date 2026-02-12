import { AlertTriangle, CheckCircle, Clock, Radio } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useDashboardData } from '../DashboardDataContext'

export const Analytics = () => {
  const { analyticsData } = useDashboardData()
  const statusCounts = analyticsData.statusBreakdown.reduce(
    (acc, status) => {
      const key = status.label.toLowerCase()
      acc.total += status.count
      acc[key] = status.count
      return acc
    },
    {
      total: 0,
      synced: 0,
      pending: 0,
      failed: 0,
      draft: 0,
    } as Record<string, number>
  )
  const needsAttention = statusCounts.failed + statusCounts.draft

  const colors = ['#C9C16C', '#A89D4C', '#E57373', '#b0b0b0', '#ffffff']

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#C9C16C] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        PODCAST ANALYTICS
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {[
          {
            label: 'TOTAL PODCASTS',
            value: statusCounts.total.toLocaleString(),
            icon: Radio,
            change: `${statusCounts.synced} synced`,
          },
          {
            label: 'SYNCED',
            value: statusCounts.synced.toLocaleString(),
            icon: CheckCircle,
            change: `${statusCounts.pending} pending`,
          },
          {
            label: 'PENDING',
            value: statusCounts.pending.toLocaleString(),
            icon: Clock,
            change: `${statusCounts.failed} failed`,
          },
          {
            label: 'NEEDS ATTENTION',
            value: needsAttention.toLocaleString(),
            icon: AlertTriangle,
            change: `${statusCounts.draft} drafts`,
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-[#0f0f0f] border-2 border-[#2a2a2a] p-6 rounded-sm">
              <Icon className="w-6 h-6 text-[#C9C16C] mb-4" />
              <p
                className="text-xs text-[#b0b0b0] mb-2 tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                {metric.label}
              </p>
              <p
                className="text-2xl text-[#ffffff] mb-1 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                {metric.value}
              </p>
              <p className="text-xs text-[#C9C16C]" style={{ fontFamily: 'monospace' }}>
                {metric.change}
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
        <h3
          className="text-xl text-[#C9C16C] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          SUBMISSION VOLUME
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.monthlySubmissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="month"
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000000',
                border: '2px solid #C9C16C',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="submissions"
              stroke="#C9C16C"
              strokeWidth={3}
              dot={{ fill: '#C9C16C', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            STATUS BREAKDOWN
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.statusBreakdown}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.label}`}
                >
                  {analyticsData.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000000',
                    border: '2px solid #C9C16C',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
          <h3
            className="text-xl text-[#C9C16C] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            TOP CATEGORIES
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="category"
                stroke="#b0b0b0"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <YAxis
                stroke="#b0b0b0"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '2px solid #C9C16C',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#C9C16C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border-4 border-[#C9C16C] p-6 rounded-sm">
        <h3
          className="text-xl text-[#C9C16C] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          SUBMISSIONS BY HOUR
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analyticsData.hourlySubmissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="hour"
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#b0b0b0"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000000',
                border: '2px solid #C9C16C',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="submissions"
              stroke="#C9C16C"
              strokeWidth={3}
              dot={{ fill: '#C9C16C', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
