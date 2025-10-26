'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { api } from '@/app/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Habit, TargetType } from '@/app/lib/types'
import { Check, Plus, Minus } from 'lucide-react'

interface HabitToggleListProps {
  onSave?: () => void
}

export default function HabitToggleList({ onSave }: HabitToggleListProps) {
  const { data: habits, mutate, isLoading } = useSWR('/habits', api.getHabits)
  const [todayValues, setTodayValues] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Initialize today's values
  useEffect(() => {
    if (habits) {
      const initialValues: Record<string, number> = {}
      habits.forEach(habit => {
        if (habit.targetType === 'boolean') {
          initialValues[habit.id] = 0 // Default to unchecked
        } else {
          initialValues[habit.id] = 0 // Default to 0 for count/duration
        }
      })
      setTodayValues(initialValues)
    }
  }, [habits])

  const updateValue = (habitId: string, value: number) => {
    setTodayValues(prev => ({
      ...prev,
      [habitId]: value
    }))
  }

  const handleSave = async () => {
    if (!habits) return

    setIsSaving(true)
    try {
      const items = habits
        .filter(habit => todayValues[habit.id] > 0)
        .map(habit => ({
          habitId: habit.id,
          value: todayValues[habit.id]
        }))

      await api.upsertTodayCheckins(items)
      
      // Optimistic update - refresh habits data
      mutate()
      
      toast({
        title: "Great job!",
        description: `Saved ${items.length} habit check-ins for today.`,
      })
      
      onSave?.()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderHabitControl = (habit: Habit) => {
    const value = todayValues[habit.id] || 0

    if (habit.targetType === 'boolean') {
      return (
        <Button
          variant={value > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => updateValue(habit.id, value > 0 ? 0 : 1)}
          className="min-w-[80px]"
        >
          {value > 0 ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Done
            </>
          ) : (
            'Mark Done'
          )}
        </Button>
      )
    }

    // Count or duration habits
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateValue(habit.id, Math.max(0, value - 1))}
          disabled={value <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="min-w-[40px] text-center font-medium">
          {value}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateValue(habit.id, value + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!habits || habits.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No habits yet</p>
          <p className="text-sm">Create your first habit to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {habits.map(habit => (
        <Card key={habit.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{habit.name}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {habit.targetType}
                {habit.targetType !== 'boolean' && ` (target: ${habit.targetValue})`}
              </div>
            </div>
            <div className="ml-4">
              {renderHabitControl(habit)}
            </div>
          </div>
        </Card>
      ))}
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Saving...' : 'Save Today'}
        </Button>
      </div>
    </div>
  )
}
