"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

  async function handleHire(worker: Worker) {
    if (!user || !categoryId) return

    setHiringWorkerId(worker.id)

    try {
      await jobApi.create(user.id, worker.id, parseInt(categoryId))
      toast.success(`Successfully hired ${worker.name}!`)
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
                    <span className="text-lg font-semibold">{worker.name}</span>
                    <span className="text-muted-foreground">{worker.category}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{worker.rating?.toFixed(1) || "New"}</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-6 text-lg font-semibold"
                    onClick={() => handleHire(worker)}
                    disabled={hiringWorkerId === worker.id}
                  >
                    {hiringWorkerId === worker.id ? (
                      <Spinner className="mr-2" />
                    ) : null}
                    Hire
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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
