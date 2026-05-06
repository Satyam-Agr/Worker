"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { categoryApi, workerApi, type Category } from "@/lib/api"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function WorkerSetupPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "WORKER") {
      router.push("/home")
      return
    }

    async function fetchCategories() {
      try {
        const data = await categoryApi.getAll()
        setCategories(data)
      } catch (error) {
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [user, router])

  async function handleSubmit() {
    if (!user || !selectedCategoryId) {
      toast.error("Please select a service category")
      return
    }

    setIsSubmitting(true)

    try {
      await workerApi.createProfile(user.id, selectedCategoryId)
      toast.success("Profile created successfully!")
      router.push("/worker/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription className="text-lg">
            Select the service you provide
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    className="h-16 text-lg font-semibold justify-between px-6"
                    onClick={() => setSelectedCategoryId(category.id)}
                    disabled={isSubmitting}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm opacity-70">Rs. {category.basePrice}</span>
                  </Button>
                ))}
              </div>

              <Button
                size="lg"
                className="h-14 text-lg font-semibold mt-4"
                onClick={handleSubmit}
                disabled={!selectedCategoryId || isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? "Creating profile..." : "Continue"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
