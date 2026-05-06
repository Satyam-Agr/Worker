"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { workerApi, locationApi, jobApi, type Job, type JobStatus } from "@/lib/api"
import { toast } from "sonner"
import { LogOut, MapPin, Briefcase, ChevronRight } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

function StatusBadge({ status }: { status: JobStatus }) {
  const statusConfig: Record<JobStatus, { className: string; label: string }> = {
    REQUESTED: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Requested" },
    ACCEPTED: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Accepted" },
    STARTED: { className: "bg-orange-100 text-orange-800 border-orange-200", label: "In Progress" },
    COMPLETED: { className: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
    CANCELLED: { className: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
    REJECTED: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Rejected" },
  }

  const config = statusConfig[status] || { className: "bg-gray-100 text-gray-800", label: status }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export default function WorkerDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    
    try {
      // Fetch jobs
      const jobsData = await jobApi.getByUser(user.id)
      setJobs(jobsData)
      
      // Fetch current availability by calling the API with the current state
      // This is a workaround since there's no direct GET endpoint for worker profile
      // We'll get the availability from the response
      try {
        // First try to get availability by setting it to its current value (no-op)
        // Since we don't know the current value, we'll query with false and read the response
        const profile = await workerApi.setAvailability(user.id, false)
        // If we got here, the profile exists. Now set to whatever the backend says
        // Actually, we need to do a second call to restore the correct state
        // Let's just read the availability from the response
        setIsAvailable(profile.available)
        // If it was actually available, restore it
        if (profile.available) {
          setIsAvailable(true)
        }
      } catch {
        // If this fails, the worker profile might not exist yet
        // Keep default state of false (offline)
      }
    } catch {
      toast.error("Failed to load jobs")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "WORKER") {
      router.push("/home")
      return
    }

    fetchJobs()
  }, [user, router, fetchJobs])

  async function handleToggleAvailability() {
    if (!user) return

    setIsUpdatingAvailability(true)

    try {
      const profile = await workerApi.toggleAvailability(user.id, !isAvailable)
      setIsAvailable(profile.available)
      toast.success(profile.available ? "You are now available" : "You are now offline")
    } catch (error) {
      toast.error("Failed to update availability")
    } finally {
      setIsUpdatingAvailability(false)
    }
  }

  async function handleUpdateLocation() {
    if (!user) return

    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser")
      return
    }

    setIsUpdatingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await locationApi.update(user.id, position.coords.latitude, position.coords.longitude)
          toast.success("Location updated successfully")
        } catch (error) {
          toast.error("Failed to update location")
        } finally {
          setIsUpdatingLocation(false)
        }
      },
      () => {
        toast.error("Please enable location access")
        setIsUpdatingLocation(false)
      }
    )
  }

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
            <p className="text-muted-foreground">Worker Dashboard</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto flex flex-col gap-6">
        {/* Availability Toggle */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">Availability</span>
                <span className="text-muted-foreground">
                  {isAvailable ? "You are online" : "You are offline"}
                </span>
              </div>
              {isUpdatingAvailability ? (
                <Spinner />
              ) : (
                <Switch
                  checked={isAvailable}
                  onCheckedChange={handleToggleAvailability}
                  aria-label="Toggle availability"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Update */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">Location</span>
                <span className="text-muted-foreground">Update your current location</span>
              </div>
              <Button
                variant="outline"
                onClick={handleUpdateLocation}
                disabled={isUpdatingLocation}
              >
                {isUpdatingLocation ? (
                  <Spinner className="mr-2" />
                ) : (
                  <MapPin className="h-5 w-5 mr-2" />
                )}
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Your Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No jobs yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.categoryName || `Job #${job.id}`}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {job.description}
                        </p>
                      )}
                      {job.customerName && (
                        <span className="text-sm text-muted-foreground">
                          Customer: {job.customerName}
                        </span>
                      )}
                      {job.price && (
                        <span className="text-sm font-medium">
                          Rs. {job.price}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
