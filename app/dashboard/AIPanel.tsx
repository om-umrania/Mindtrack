'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/app/lib/api'
import { Nudge, Recommendation } from '@/app/lib/types'
import { Sparkles, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import useSWR from 'swr'

interface AIPanelProps {
  className?: string
}

export function AIPanel({ className }: AIPanelProps) {
  const [isGeneratingNudge, setIsGeneratingNudge] = useState(false)
  const [recentNudges, setRecentNudges] = useState<Nudge[]>([])
  const [expandedNudge, setExpandedNudge] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: recommendations, isLoading: isLoadingRecs } = useSWR(
    '/ai/recommendations', 
    api.recommendations,
    { revalidateOnFocus: false }
  )

  const generateNudge = async () => {
    setIsGeneratingNudge(true)
    try {
      const nudge = await api.nudge({
        timestamp: new Date().toISOString(),
        userContext: 'dashboard_view'
      })
      
      setRecentNudges(prev => [nudge, ...prev.slice(0, 4)]) // Keep last 5
      
      toast({
        title: "New nudge generated!",
        description: nudge.message,
      })
    } catch (error) {
      toast({
        title: "Failed to generate nudge",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingNudge(false)
    }
  }

  const toggleNudgeExpansion = (nudgeId: string) => {
    setExpandedNudge(expandedNudge === nudgeId ? null : nudgeId)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Nudge Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Nudges
          </CardTitle>
          <CardDescription>
            Get personalized motivation and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={generateNudge}
            disabled={isGeneratingNudge}
            className="w-full"
          >
            {isGeneratingNudge ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Nudge
              </>
            )}
          </Button>

          {recentNudges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Nudges</h4>
              {recentNudges.map(nudge => (
                <div key={nudge.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm flex-1">{nudge.message}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNudgeExpansion(nudge.id)}
                    >
                      {expandedNudge === nudge.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {expandedNudge === nudge.id && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Context: {JSON.stringify(nudge.context, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            New habits to try based on your patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecs ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map(rec => (
                <div key={rec.id} className="border rounded-lg p-3">
                  <div className="font-medium text-sm">{rec.habitName}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rec.rationale}
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Add Habit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">No recommendations yet</p>
              <p className="text-xs">Track some habits to get personalized suggestions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
