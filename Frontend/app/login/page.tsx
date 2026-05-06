"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/lib/api"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Attempting login with phone:", phone)
      const user = await authApi.login(phone)
      console.log("[v0] Login successful, user:", user)
      setUser(user)
      toast.success("Login successful!")
      
      if (user.role === "WORKER") {
        router.push("/worker/dashboard")
      } else {
        router.push("/home")
      }
    } catch (error) {
      console.error("[v0] Login failed:", error)
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Worker</CardTitle>
          <CardDescription className="text-lg">Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-lg font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-lg"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="h-14 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="text-primary underline font-medium">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
