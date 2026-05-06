"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { jobApi, reviewApi, type Job, type JobStatus } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, Phone, User, Clock, Star } from "lucide-react"
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

function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return dateString
  }
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const fetchJob = useCallback(async () => {
    if (!user) return

    try {
      const jobs = await jobApi.getByUser(user.id)
      const foundJob = jobs.find((j) => j.id === parseInt(id))
      if (foundJob) {
        setJob(foundJob)
      } else {
        toast.error("Job not found")
        router.push("/jobs")
      }
    } catch {
      toast.error("Failed to load job details")
    } finally {
      setIsLoading(false)
    }
  }, [user, id, router])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchJob()
  }, [user, router, fetchJob])

  async function handleCancel() {
    if (!job || !user) return
    setIsActionLoading(true)
    try {
      const updatedJob = await jobApi.cancel(job.id, user.id)
      setJob(updatedJob)
      toast.success("Job cancelled successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel job")
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleAccept() {
    if (!job || !user) return
    setIsActionLoading(true)
    try {
      const updatedJob = await jobApi.updateStatus(job.id, "ACCEPTED", user.id)
      setJob(updatedJob)
      toast.success("Job accepted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept job")
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleReject() {
    if (!job || !user) return
    setIsActionLoading(true)
    try {
      const updatedJob = await jobApi.reject(job.id, user.id)
      setJob(updatedJob)
      toast.success("Job rejected")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject job")
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleStart() {
    if (!job || !user) return
    setIsActionLoading(true)
    try {
      const updatedJob = await jobApi.start(job.id, user.id)
      setJob(updatedJob)
      toast.success("Job started")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start job")
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleComplete() {
    if (!job || !user) return
    setIsActionLoading(true)
    try {
      const updatedJob = await jobApi.complete(job.id, user.id)
      setJob(updatedJob)
      toast.success("Job completed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete job")
    } finally {
      setIsActionLoading(false)
    }
  }

  async function handleSubmitReview() {
    if (!job || !user || rating === 0) {
      toast.error("Please select a rating")
      return
    }
    setIsSubmittingReview(true)
    try {
      await reviewApi.create(job.id, user.id, rating, comment || undefined)
      setHasReviewed(true)
      toast.success("Review submitted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  function renderCustomerActions() {
    if (!job || user?.role !== "CUSTOMER") return null

    switch (job.status) {
      case "REQUESTED":
      case "ACCEPTED":
        return (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancel}
            disabled={isActionLoading}
          >
            {isActionLoading && <Spinner className="mr-2" />}
            Cancel Job
          </Button>
        )
      case "STARTED":
        return (
          <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-center">
            Work in progress
          </div>
        )
      case "COMPLETED":
        if (hasReviewed) {
          return (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
              Thank you for your review!
            </div>
          )
        }
        return renderReviewForm("Rate Worker")
      default:
        return null
    }
  }

  function renderWorkerActions() {
    if (!job || user?.role !== "WORKER") return null

    switch (job.status) {
      case "REQUESTED":
        return (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReject}
              disabled={isActionLoading}
            >
              {isActionLoading && <Spinner className="mr-2" />}
              Reject
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={isActionLoading}
            >
              {isActionLoading && <Spinner className="mr-2" />}
              Accept
            </Button>
          </div>
        )
      case "ACCEPTED":
        return (
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={isActionLoading}
          >
            {isActionLoading && <Spinner className="mr-2" />}
            Start Work
          </Button>
        )
      case "STARTED":
        return (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleComplete}
            disabled={isActionLoading}
          >
            {isActionLoading && <Spinner className="mr-2" />}
            Complete Job
          </Button>
        )
      case "COMPLETED":
        if (hasReviewed) {
          return (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
              Thank you for your review!
            </div>
          )
        }
        return renderReviewForm("Rate Customer")
      default:
        return null
    }
  }

  function renderReviewForm(title: string) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmittingReview || rating === 0}
          >
            {isSubmittingReview && <Spinner className="mr-2" />}
            Submit Review
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/jobs")}
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Job #{id}</h1>
            <p className="text-sm text-muted-foreground">Job Details</p>
          </div>
          {job && <StatusBadge status={job.status} />}
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : job ? (
          <>
            {/* Job Info */}
            <Card>
              <CardContent className="p-4 flex flex-col gap-4">
                {/* Category & Price */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{job.categoryName}</span>
                  {job.price && (
                    <span className="text-lg font-bold">Rs. {job.price}</span>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <div className="text-muted-foreground border-t pt-4">
                    <p className="text-sm font-medium text-foreground mb-1">Description</p>
                    <p>{job.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* People Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Worker Info */}
                {job.workerName && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Worker</p>
                      <p className="font-medium">{job.workerName}</p>
                      {job.workerPhone && (
                        <a
                          href={`tel:${job.workerPhone}`}
                          className="text-sm text-primary flex items-center gap-1 mt-1"
                        >
                          <Phone className="h-3 w-3" />
                          {job.workerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                {job.customerName && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{job.customerName}</p>
                      {job.customerPhone && (
                        <a
                          href={`tel:${job.customerPhone}`}
                          className="text-sm text-primary flex items-center gap-1 mt-1"
                        >
                          <Phone className="h-3 w-3" />
                          {job.customerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(job.createdAt)}</span>
                </div>
                {job.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span>{formatDateTime(job.startedAt)}</span>
                  </div>
                )}
                {job.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDateTime(job.completedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              {user.role === "CUSTOMER" ? renderCustomerActions() : renderWorkerActions()}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Job not found
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
