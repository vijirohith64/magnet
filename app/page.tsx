"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Lock, UserCheck, Settings } from "lucide-react"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import Image from "next/image"
import Link from "next/link"

const departments = [
  "B.Tech. in Computer Science and Engineering",
  "B.Tech. in Artificial Intelligence and Data Science",
  "B.Tech. in Food Technology",
  "B.Tech. in Biotechnology",
  "B.Tech. in Computer Science and Engineering (Cyber Security)",
  "B.Tech. in Biomedical Engineering",
  "B.Tech. in Computer Science and Engineering (IOT)",
  "B.Tech. in Information Technology",
  "B.Tech. in Agricultural Engineering",
  "B.Tech. in Electronics and Communication Engineering",
  "B.Tech. in Artificial Intelligence and Machine Learning",
  "B.Tech. in Mechanical Engineering",
  "B.Tech. in Electrical and Electronics Engineering",
]

export default function CollegeReviewPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    department: "",
    complaint: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: "", email: "", gender: "", department: "", complaint: "" })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-balance">Thank you for your opinion</h2>
              <p className="text-muted-foreground text-sm text-pretty">
                Your feedback has been securely recorded and will be reviewed by our administration team.
              </p>
              <Button onClick={() => setSubmitted(false)} className="w-full">
                Submit Another Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-4">
            <div className="relative w-24 h-24">
              <Image
                src="/images/university-logo.png"
                alt="Dhanalakshmi Srinivasan University"
                fill
                className="object-contain drop-shadow-sm"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              />
            </div>
            <Link href="/admin" className="absolute top-4 right-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">College Review System</h1>
            <p className="text-lg text-muted-foreground text-balance">Dhanalakshmi Srinivasan University</p>
            <p className="text-sm text-muted-foreground text-pretty max-w-md mx-auto">
              Share your feedback and experiences to help us improve our educational services
            </p>
          </div>
        </div>

        {/* Review Form */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-xl">Submit Your Review</CardTitle>
              <CardDescription className="text-pretty">
                Please provide your honest feedback about your college experience
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-input/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="bg-input/50">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">MALE</SelectItem>
                    <SelectItem value="FEMALE">FEMALE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="bg-input/50">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint">Your Feedback / Complaint</Label>
                <Textarea
                  id="complaint"
                  placeholder="Please share your detailed feedback, suggestions, or complaints about your college experience..."
                  value={formData.complaint}
                  onChange={(e) => handleInputChange("complaint", e.target.value)}
                  required
                  rows={6}
                  className="bg-input/50 resize-none"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Data Security & Privacy
                </h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Your information is secure and will only be shared with our respected associated dean. All submissions
                  are encrypted and handled with strict confidentiality to ensure your privacy and safety.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <InstallPrompt />
      <footer className="mt-16 text-center">
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
