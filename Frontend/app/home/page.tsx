"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { categoryApi, type Category } from "@/lib/api"
import { toast } from "sonner"
import { LogOut, Briefcase } from "lucide-react"

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "CUSTOMER") {
      router.push("/worker/dashboard")
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

  function handleCategoryClick(category: Category) {
    router.push(`/search?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`)
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
            <p className="text-muted-foreground">What service do you need?</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/jobs")}
              aria-label="My Jobs"
            >
              <Briefcase className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No services available at the moment
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-lg font-semibold">{category.name}</span>
                  <span className="text-muted-foreground">
                    From Rs. {category.basePrice}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
