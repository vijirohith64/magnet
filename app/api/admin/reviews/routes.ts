"use client"

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
  EyeOff,
  Calendar,
  User,
  Mail,
  FileText,
  LogOut,
  Search,
  Database,
  Server,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
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

  // -------------------------------
  // LOGIN
  // -------------------------------
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

  // -------------------------------
  // FETCH REVIEWS
  // -------------------------------
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

  // -------------------------------
  // DELETE REVIEW
  // -------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const response = await fetch(`/api/review/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminKey || localStorage.getItem("adminKey")}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message || "Review deleted successfully")
        fetchReviews()
      } else {
        alert(data.message || "Failed to delete review")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Something went wrong")
    }
  }

  // -------------------------------
  // UPDATE STATUS
  // -------------------------------
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

  // -------------------------------
  // FILTERING
  // -------------------------------
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

  // -------------------------------
  // LOGIN SCREEN
  // -------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Image src="/images/university-logo.png" alt="DSU Logo" fill className="object-contain drop-shadow-sm" />
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
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -------------------------------
  // MAIN DASHBOARD
  // -------------------------------
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Reviews Table with Delete Button */}
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
                      <TableCell>{review.department}</TableCell>
                      <TableCell>
                        <Badge>{review.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(review.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="flex gap-2">
                        {/* View Button */}
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
                                <p><b>Name:</b> {selectedReview.name}</p>
                                <p><b>Email:</b> {selectedReview.email}</p>
                                <p><b>Complaint:</b> {selectedReview.complaint}</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(review._id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
