'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/app/lib/api'
import { TargetType } from '@/app/lib/types'
import { Plus } from 'lucide-react'
import HabitToggleList from './HabitToggleList'
import { AuthenticatedLayout } from '@/components/authenticated-layout'

function HabitsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitType, setNewHabitType] = useState<TargetType>('boolean')
  const [newHabitTarget, setNewHabitTarget] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return

    setIsCreating(true)
    try {
      await api.createHabit({
        name: newHabitName,
        targetType: newHabitType,
        targetValue: newHabitTarget
      })
      
      toast({
        title: "Habit created!",
        description: `${newHabitName} has been added to your habits.`,
      })
      
      setNewHabitName('')
      setNewHabitType('boolean')
      setNewHabitTarget(1)
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: "Failed to create habit",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Habits</h1>
          <p className="text-muted-foreground">Track your daily habits and build consistency</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track your daily progress.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Habit Name</label>
                <Input
                  placeholder="e.g., Drink water, Exercise, Read"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newHabitType}
                  onChange={(e) => setNewHabitType(e.target.value as TargetType)}
                >
                  <option value="boolean">Yes/No (Did you do it?)</option>
                  <option value="count">Count (How many times?)</option>
                  <option value="duration">Duration (How long?)</option>
                </select>
              </div>
              {newHabitType !== 'boolean' && (
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    min="1"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHabit} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Habit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <HabitToggleList />
    </div>
  )
}

export default function HabitsPage() {
  return (
    <AuthenticatedLayout>
      <HabitsContent />
    </AuthenticatedLayout>
  )
}
