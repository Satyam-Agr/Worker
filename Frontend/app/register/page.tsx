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

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER")
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    
    if (!phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    setIsLoading(true)

    try {
      const user = await authApi.register({ name, phone, role })
      setUser(user)
      toast.success("Registration successful!")
      
      if (user.role === "WORKER") {
        router.push("/worker/setup")
      } else {
        router.push("/home")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-lg">Join as a customer or worker</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-lg font-medium">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg"
                disabled={isLoading}
              />
            </div>

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

            <div className="flex flex-col gap-3">
              <label className="text-lg font-medium">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === "CUSTOMER" ? "default" : "outline"}
                  className="h-16 text-lg font-semibold"
                  onClick={() => setRole("CUSTOMER")}
                  disabled={isLoading}
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={role === "WORKER" ? "default" : "outline"}
                  className="h-16 text-lg font-semibold"
                  onClick={() => setRole("WORKER")}
                  disabled={isLoading}
                >
                  Worker
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="h-14 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
