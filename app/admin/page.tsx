"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Eye,
  Calendar,
  User,
  Mail,
  FileText,
  LogOut,
  Search,
  EyeOff,
  Database,
  Server,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import Image from "next/image"

interface Review {
  _id: string
  name: string
  email: string
  department: string
  complaint: string
  submittedAt: string
  status: "pending" | "reviewed" | "resolved"
  ipAddress: string
}

interface EndpointTest {
  name: string
  url: string
  method: string
  status: "idle" | "testing" | "success" | "error"
  response?: string
  responseTime?: number
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")

  const [endpoints, setEndpoints] = useState<EndpointTest[]>([
    { name: "MongoDB Connection", url: "/api/test-db", method: "GET", status: "idle" },
    { name: "Reviews API", url: "/api/reviews", method: "GET", status: "idle" },
    { name: "Admin Auth", url: "/api/admin/auth", method: "POST", status: "idle" },
    { name: "Admin Reviews", url: "/api/admin/reviews", method: "GET", status: "idle" },
  ])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem("adminKey", adminKey)
        fetchReviews()
      } else {
        alert("Invalid admin key")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews", {
        headers: {
          Authorization: `Bearer ${adminKey || localStorage.getItem("adminKey")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const testEndpoint = async (index: number) => {
    const endpoint = endpoints[index]
    const startTime = Date.now()

    setEndpoints((prev) => prev.map((ep, i) => (i === index ? { ...ep, status: "testing" as const } : ep)))

    try {
      const headers: Record<string, string> = {}
      let body: string | undefined

      if (endpoint.method === "POST" && endpoint.url.includes("auth")) {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify({ adminKey: adminKey || localStorage.getItem("adminKey") })
      } else if (endpoint.url.includes("admin") || endpoint.url.includes("reviews")) {
        headers["Authorization"] = `Bearer ${adminKey || localStorage.getItem("adminKey")}`
      }

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        body,
      })

      const responseTime = Date.now() - startTime
      const responseText = await response.text()

      setEndpoints((prev) =>
        prev.map((ep, i) =>
          i === index
            ? {
                ...ep,
                status: response.ok ? ("success" as const) : ("error" as const),
                response: responseText,
                responseTime,
              }
            : ep,
        ),
      )
    } catch (error) {
      const responseTime = Date.now() - startTime
      setEndpoints((prev) =>
        prev.map((ep, i) =>
          i === index
            ? {
                ...ep,
                status: "error" as const,
                response: error instanceof Error ? error.message : "Unknown error",
                responseTime,
              }
            : ep,
        ),
      )
    }
  }

  const testAllEndpoints = async () => {
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  const updateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey || localStorage.getItem("adminKey")}`,
        },
        body: JSON.stringify({ reviewId, status: newStatus }),
      })

      if (response.ok) {
        fetchReviews()
      }
    } catch (error) {
      console.error("Error updating review:", error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminKey("")
    localStorage.removeItem("adminKey")
    setReviews([])
  }

  useEffect(() => {
    const savedKey = localStorage.getItem("adminKey")
    if (savedKey) {
      setAdminKey(savedKey)
      setIsAuthenticated(true)
      fetchReviews()
    }
  }, [])

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.complaint.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || review.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = [...new Set(reviews.map((r) => r.department))]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/images/university-logo.png"
                  alt="DSU Logo"
                  fill
                  className="object-contain drop-shadow-sm"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">Admin Access</CardTitle>
              <CardDescription>Enter your admin key to access the review dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Key</Label>
                <div className="relative">
                  <Input
                    id="adminKey"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                    className="bg-input/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">Secure Access</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This dashboard is restricted to authorized personnel only
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p
            className="text-sm text-muted-foreground/60"
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              letterSpacing: "0.5px",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            created by Reh
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src="/images/university-logo.png"
              alt="DSU Logo"
              fill
              className="object-contain drop-shadow-sm"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">College Review Management System</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.filter((r) => r.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.filter((r) => r.status === "reviewed").length}</p>
                <p className="text-xs text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.filter((r) => r.status === "resolved").length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Health & API Endpoints
              </CardTitle>
              <CardDescription>Test API endpoints and monitor system status</CardDescription>
            </div>
            <Button onClick={testAllEndpoints} variant="outline" size="sm">
              Test All Endpoints
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {endpoint.status === "idle" && <Database className="w-4 h-4 text-muted-foreground" />}
                    {endpoint.status === "testing" && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                    {endpoint.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {endpoint.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{endpoint.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {endpoint.method} {endpoint.url}
                      {endpoint.responseTime && <span className="ml-2">({endpoint.responseTime}ms)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      endpoint.status === "success"
                        ? "default"
                        : endpoint.status === "error"
                          ? "destructive"
                          : endpoint.status === "testing"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {endpoint.status}
                  </Badge>
                  <Button
                    onClick={() => testEndpoint(index)}
                    variant="outline"
                    size="sm"
                    disabled={endpoint.status === "testing"}
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input/50"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-input/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px] bg-input/50">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Student Reviews</CardTitle>
          <CardDescription>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{review.department}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            review.status === "pending"
                              ? "secondary"
                              : review.status === "reviewed"
                                ? "default"
                                : "outline"
                          }
                        >
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(review.submittedAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Details</DialogTitle>
                              <DialogDescription>
                                Submitted on {new Date(review.submittedAt).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedReview && (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      Student Name
                                    </Label>
                                    <p className="text-sm bg-muted p-2 rounded">{selectedReview.name}</p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      Email
                                    </Label>
                                    <p className="text-sm bg-muted p-2 rounded">{selectedReview.email}</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Feedback / Complaint</Label>
                                  <Textarea value={selectedReview.complaint} readOnly rows={6} className="bg-muted" />
                                </div>

                                <div className="space-y-2">
                                  <Label>Update Status</Label>
                                  <Select
                                    value={selectedReview.status}
                                    onValueChange={(value) => updateReviewStatus(selectedReview._id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="reviewed">Reviewed</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredReviews.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No reviews found matching your criteria</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center pt-8">
        <p
          className="text-sm text-muted-foreground/60"
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            letterSpacing: "0.5px",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          created by Reh
        </p>
      </footer>
    </div>
  )
}
