import { TrendingUp, Users, Globe, Clock } from 'lucide-react'
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
  const topCountries = [
    { country: 'United States', listens: 234567, percentage: 42 },
    { country: 'United Kingdom', listens: 98234, percentage: 18 },
    { country: 'Canada', listens: 76543, percentage: 14 },
    { country: 'Australia', listens: 54321, percentage: 10 },
    { country: 'Germany', listens: 43210, percentage: 8 },
  ]

  const listeningTime = [
    { hour: '00:00', listens: 234 },
    { hour: '03:00', listens: 156 },
    { hour: '06:00', listens: 789 },
    { hour: '09:00', listens: 1234 },
    { hour: '12:00', listens: 2345 },
    { hour: '15:00', listens: 2890 },
    { hour: '18:00', listens: 3456 },
    { hour: '21:00', listens: 2123 },
  ]

  const colors = ['#C89E3E', '#1A2744', '#A8782F', '#D4A94E', '#8A94A6']

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl text-[#D4A94E] tracking-wider"
        style={{ fontFamily: 'monospace' }}
      >
        ANALYTICS DASHBOARD
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'AVG. LISTEN TIME', value: '34:52', icon: Clock, change: '+2.4 min' },
          { label: 'COMPLETION RATE', value: '76.4%', icon: TrendingUp, change: '+5.2%' },
          { label: 'NEW SUBSCRIBERS', value: '1,234', icon: Users, change: '+18.3%' },
          { label: 'REACH', value: '47 countries', icon: Globe, change: '+3' },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-[#0B1226] border-2 border-[#1D1B35] p-6 rounded-sm">
              <Icon className="w-6 h-6 text-[#C89E3E] mb-4" />
              <p
                className="text-xs text-[#8A94A6] mb-2 tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                {metric.label}
              </p>
              <p
                className="text-2xl text-[#EEFCF1] mb-1 tracking-wider"
                style={{ fontFamily: 'monospace' }}
              >
                {metric.value}
              </p>
              <p className="text-xs text-[#D4A94E]" style={{ fontFamily: 'monospace' }}>
                {metric.change} THIS WEEK
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
        <h3
          className="text-xl text-[#D4A94E] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          SUBSCRIBER GROWTH
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D1B35" />
            <XAxis
              dataKey="month"
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070B1A',
                border: '2px solid #C89E3E',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="subscribers"
              stroke="#C89E3E"
              strokeWidth={3}
              dot={{ fill: '#C89E3E', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            LISTENER DEMOGRAPHICS
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.demographics}
                  dataKey="percentage"
                  nameKey="age"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.age}`}
                >
                  {analyticsData.demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070B1A',
                    border: '2px solid #C89E3E',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
          <h3
            className="text-xl text-[#D4A94E] mb-6 tracking-wider"
            style={{ fontFamily: 'monospace' }}
          >
            TOP COUNTRIES
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCountries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D1B35" />
              <XAxis
                dataKey="country"
                stroke="#8A94A6"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <YAxis
                stroke="#8A94A6"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070B1A',
                  border: '2px solid #C89E3E',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="listens" fill="#C89E3E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0B1226] border-4 border-[#C89E3E] p-6 rounded-sm">
        <h3
          className="text-xl text-[#D4A94E] mb-6 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          LISTENING TIMES
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={listeningTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D1B35" />
            <XAxis
              dataKey="hour"
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <YAxis
              stroke="#8A94A6"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070B1A',
                border: '2px solid #C89E3E',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="listens"
              stroke="#C89E3E"
              strokeWidth={3}
              dot={{ fill: '#C89E3E', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
