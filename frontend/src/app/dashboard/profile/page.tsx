
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import axios, { isAxiosError } from 'axios'
import { User, Mail, Save, Loader2 } from 'lucide-react'

interface ProfileData {
  username: string
  bio: string
  phone_number: string
}

export default function ProfilePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    bio: '',
    phone_number: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        phone_number: user.phone_number || ''
      })
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }

    try {
      setIsSubmitting(true)
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/profiles/me`,
        formData,
        { withCredentials: true }
      )
      
      toast.success('Profile updated successfully!')
      router.refresh()
      
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-brand-bg py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-primary">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
                <CardDescription>
                  Your basic profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-brand-accent text-white text-xl">
                      {user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.username || 'No username set'}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="254712345678"
                      type="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-accent hover:bg-brand-accent/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
