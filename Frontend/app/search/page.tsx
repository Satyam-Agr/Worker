"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { workerApi, jobApi, type Worker } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, MapPin, Star } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

function SearchContent() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hiringWorkerId, setHiringWorkerId] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [description, setDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const categoryId = searchParams.get("categoryId")
  const categoryName = searchParams.get("categoryName")

  const searchWorkers = useCallback(async (lat: number, lng: number) => {
    if (!categoryId) return
    
    try {
      const data = await workerApi.getNearby(lat, lng, parseInt(categoryId))
      setWorkers(data)
    } catch (error) {
      toast.error("Failed to find workers nearby")
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!categoryId) {
      router.push("/home")
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          searchWorkers(position.coords.latitude, position.coords.longitude)
        },
        () => {
          setLocationError("Please enable location to find workers near you")
          setIsLoading(false)
        }
      )
    } else {
      setLocationError("Location is not supported by your browser")
      setIsLoading(false)
    }
  }, [user, router, categoryId, searchWorkers])

  function openHireDialog(worker: Worker) {
    setSelectedWorker(worker)
    setDescription("")
    setIsDialogOpen(true)
  }

  async function handleConfirmHire() {
    if (!user || !categoryId || !selectedWorker) return

    setHiringWorkerId(selectedWorker.id)

    try {
      await jobApi.create(user.id, selectedWorker.id, parseInt(categoryId), description || undefined)
      toast.success(`Successfully hired ${selectedWorker.name}!`)
      setIsDialogOpen(false)
      router.push("/jobs")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to hire worker")
    } finally {
      setHiringWorkerId(null)
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
            <h1 className="text-xl font-bold">{categoryName || "Workers"}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Nearby workers
            </p>
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
        ) : locationError ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{locationError}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : workers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No workers available nearby for this service
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {workers.map((worker) => (
              <Card key={worker.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{worker.name}</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{worker.rating?.toFixed(1) || "New"}</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">{worker.category}</span>
                    {typeof worker.totalJobs === "number" && (
                      <span className="text-sm text-muted-foreground">
                        {worker.totalJobs} jobs completed
                      </span>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-6 text-lg font-semibold"
                    onClick={() => openHireDialog(worker)}
                  >
                    View & Hire
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hire Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {selectedWorker && (
              <Card>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{selectedWorker.name}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedWorker.rating?.toFixed(1) || "New"}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">{selectedWorker.category}</span>
                  {selectedWorker.phone && (
                    <span className="text-sm text-muted-foreground">Phone: {selectedWorker.phone}</span>
                  )}
                  {typeof selectedWorker.totalJobs === "number" && (
                    <span className="text-sm text-muted-foreground">
                      Completed Jobs: {selectedWorker.totalJobs}
                    </span>
                  )}
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Describe the work
              </label>
              <Textarea
                id="description"
                placeholder="e.g., Kitchen deep clean, 3 rooms to clean..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={hiringWorkerId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmHire}
              disabled={hiringWorkerId !== null}
            >
              {hiringWorkerId !== null && <Spinner className="mr-2" />}
              Confirm Hire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    }>
      <SearchContent />
    </Suspense>
  )
}
