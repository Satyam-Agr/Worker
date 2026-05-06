"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { workerApi, locationApi, jobApi, type Job } from "@/lib/api"
import { toast } from "sonner"
import { LogOut, MapPin, Briefcase } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function WorkerDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const fetchJobs = useCallback(async () => {
    if (!user) return
    
    try {
      const data = await jobApi.getByUser(user.id)
      setJobs(data)
    } catch (error) {
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

  function getStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "text-green-600"
      case "REQUESTED":
        return "text-yellow-600"
      case "IN_PROGRESS":
        return "text-blue-600"
      case "PENDING":
        return "text-yellow-600"
      case "CANCELLED":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
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
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Job #{job.id}</span>
                      {job.price && (
                        <span className="text-muted-foreground">
                          Rs. {job.price}
                        </span>
                      )}
                    </div>
                    <span className={`font-semibold ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
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
