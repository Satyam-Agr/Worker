"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { jobApi, type Job, type JobStatus } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Briefcase, ChevronRight } from "lucide-react"

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
              <Card 
                key={job.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.categoryName || `Job #${job.id}`}</CardTitle>
                    <StatusBadge status={job.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {job.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col gap-1">
                        {job.workerName && (
                          <span className="text-sm text-muted-foreground">
                            Worker: {job.workerName}
                          </span>
                        )}
                        {job.price && (
                          <span className="font-medium">Rs. {job.price}</span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
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
