"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { jobApi, type Job } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Briefcase } from "lucide-react"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
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

    fetchJobs()
  }, [user, router, fetchJobs])

  function getStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED":
        return "bg-indigo-100 text-indigo-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Jobs</h1>
            <p className="text-sm text-muted-foreground">Track your service requests</p>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4">
              <Briefcase className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No jobs yet</p>
                <p className="text-muted-foreground">
                  Browse services and hire a worker to get started
                </p>
              </div>
              <Button onClick={() => router.push("/home")}>
                Browse Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Job #{job.id}</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {job.workerName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Worker</span>
                        <span className="font-medium">{job.workerName}</span>
                      </div>
                    )}
                    {job.price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">Rs. {job.price}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
