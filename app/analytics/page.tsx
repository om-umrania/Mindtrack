'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api } from '@/app/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CompletionTrend } from '../dashboard/CompletionTrend'
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react'
import { AuthenticatedLayout } from '@/components/authenticated-layout'

function AnalyticsContent() {
  const [timeWindow, setTimeWindow] = useState<'7' | '28' | 'all'>('7')
  const { data: summary, isLoading } = useSWR(
    `/analytics/summary?window=${timeWindow}`,
    () => api.summary(timeWindow)
  )

  // Mock data for demonstration
  const trendData = [
    { date: '2024-01-01', pct: 75 },
    { date: '2024-01-02', pct: 80 },
    { date: '2024-01-03', pct: 65 },
    { date: '2024-01-04', pct: 90 },
    { date: '2024-01-05', pct: 85 },
    { date: '2024-01-06', pct: 70 },
    { date: '2024-01-07', pct: 95 },
  ]

  const leaderboardData = summary?.leaderboard || []

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your habit tracking data</p>
      </div>

      {/* Time Window Selector */}
      <div className="flex gap-2 mb-6">
        {(['7', '28', 'all'] as const).map(window => (
          <Button
            key={window}
            variant={timeWindow === window ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeWindow(window)}
          >
            {window === '7' ? '7 Days' : window === '28' ? '28 Days' : 'All Time'}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Completion Trends
            </CardTitle>
            <CardDescription>
              Your habit completion rate over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <CompletionTrend data={trendData} />
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Habit Leaderboard
            </CardTitle>
            <CardDescription>
              Your most consistent habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : leaderboardData.length > 0 ? (
              <div className="space-y-3">
                {leaderboardData.map((item, index) => (
                  <div key={item.habitId} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Habit {item.habitId}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.adherence.toFixed(0)}% adherence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leaderboard data yet</p>
                <p className="text-sm">Track habits to see your top performers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Streaks
            </CardTitle>
            <CardDescription>
              Your active habit streaks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : summary?.currentStreaks && summary.currentStreaks.length > 0 ? (
              <div className="space-y-3">
                {summary.currentStreaks.map(streak => (
                  <div key={streak.habitId} className="flex items-center justify-between">
                    <span className="font-medium">Habit {streak.habitId}</span>
                    <span className="text-sm text-muted-foreground">
                      {streak.days} days
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active streaks</p>
                <p className="text-sm">Start tracking habits to build streaks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AuthenticatedLayout>
      <AnalyticsContent />
    </AuthenticatedLayout>
  )
}
