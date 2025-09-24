"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Access Denied</h2>
                  <p className="text-sm text-muted-foreground">You need to be authenticated to access this area</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
