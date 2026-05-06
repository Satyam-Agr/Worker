"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      if (user.role === "WORKER") {
        router.push("/worker/dashboard")
      } else {
        router.push("/home")
      }
    }
  }, [user, router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground">Worker</h1>
          <p className="text-xl text-muted-foreground">
            Find skilled workers near you instantly
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            size="lg"
            className="h-16 text-xl font-semibold w-full"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-xl font-semibold w-full"
            onClick={() => router.push("/register")}
          >
            Create Account
          </Button>
        </div>
      </div>
    </main>
  )
}
