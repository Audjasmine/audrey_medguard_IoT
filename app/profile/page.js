'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Building2, MapPin, Users, Ruler, Warehouse, Pencil, Phone, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from 'react-hot-toast'

function ProfilePage() {
  const { data: session, update } = useSession()
  console.log(session);
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [formData, setFormData] = useState({
    farm_name: '',
    city: '',
    country: '',
    farm_type: '',
    farm_size: '',
    employees_number: ''
  })
  const [personalFormData, setPersonalFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  })

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/userDetails?userId=${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setUserDetails(data)
            setFormData(data)
          }
        } catch (error) {
          console.error('Error fetching user details:', error)
          toast.error('Failed to load profile')
        } finally {
          setLoading(false)
        }
      }
    }

    if (session?.user) {
      setPersonalFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        currentPassword: '',
        newPassword: '',
      })
    }

    fetchUserDetails()
  }, [session])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePersonalInputChange = (e) => {
    const { name, value } = e.target
    setPersonalFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Updating profile...')
    
    try {
      const response = await fetch('/api/userDetails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          ...formData
        }),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setUserDetails(updatedData)
        setFormData(updatedData)
        setIsEditing(false)
        
        // Send profile update email using session email
        const emailResponse = await fetch('/api/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'profileUpdate',
            userData: {
              name: session.user.name,
              email: session.user.email,  // Using email from session
              updates: updatedData
            }
          })
        });

        if (emailResponse.ok) {
          console.log('Profile update email sent successfully');
        } else {
          console.error('Failed to send profile update email');
        }

        toast.success('Farm details updated successfully', { id: toastId })
      } else {
        toast.error('Failed to update profile', { id: toastId })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', { id: toastId })
    }
  }

  const handlePersonalSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading('Updating personal information...')
    
    try {
      // Only include password fields if both are provided
      const updateData = {
        name: personalFormData.name,
        email: personalFormData.email,
        phone: personalFormData.phone,
      }

      if (personalFormData.currentPassword && personalFormData.newPassword) {
        updateData.currentPassword = personalFormData.currentPassword
        updateData.newPassword = personalFormData.newPassword
      } else if (personalFormData.currentPassword || personalFormData.newPassword) {
        toast.error('Please provide both current and new password', { id: toastId })
        return
      }

      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
          }
        })
        setIsEditingPersonal(false)
        setPersonalFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
        }))
        toast.success('Personal information updated successfully', { id: toastId })
      } else {
        toast.error(data.error || 'Failed to update personal information', { id: toastId })
      }
    } catch (error) {
      console.error('Error updating personal information:', error)
      toast.error('Failed to update personal information', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-bold text-xl tracking-tight">Profile</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsEditingPersonal(!isEditingPersonal)
                    if (!isEditingPersonal) {
                      setPersonalFormData({
                        name: session.user.name || '',
                        email: session.user.email || '',
                        phone: session.user.phone || '',
                        currentPassword: '',
                        newPassword: '',
                      })
                    }
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {isEditingPersonal ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingPersonal ? (
                <form onSubmit={handlePersonalSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <Input
                      name="name"
                      value={personalFormData.name}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <Input
                      name="email"
                      type="email"
                      value={personalFormData.email}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <Input
                      name="phone"
                      type="tel"
                      value={personalFormData.phone}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Change Password (Optional)</label>
                    <Input
                      name="currentPassword"
                      type="password"
                      placeholder="Current Password"
                      value={personalFormData.currentPassword}
                      onChange={handlePersonalInputChange}
                      className="mt-1"
                    />
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="New Password"
                      value={personalFormData.newPassword}
                      onChange={handlePersonalInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="mt-1 text-sm">{session.user.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="mt-1 text-sm">{session.user.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="mt-1 text-sm">{session.user.phone}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                    <p className="mt-1 text-sm">Active</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {userDetails && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <CardTitle>Farm Information</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                <CardDescription>Details about your farm operations</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                      <Input
                        name="farm_name"
                        value={formData.farm_name}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Input
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                        <Input
                          name="country"
                          placeholder="Country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Type</label>
                      <Input
                        name="farm_type"
                        value={formData.farm_type}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Size</label>
                      <Input
                        name="farm_size"
                        value={formData.farm_size}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number of Employees</label>
                      <Input
                        name="employees_number"
                        type="number"
                        value={formData.employees_number}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                      <p className="mt-1 text-sm">{userDetails.farm_name}</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <p className="text-sm">{userDetails.city}, {userDetails.country}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Type</label>
                      <p className="mt-1 text-sm">{userDetails.farm_type}</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Size</label>
                      <div className="flex items-center gap-1 mt-1">
                        <Ruler className="h-3 w-3 text-gray-500" />
                        <p className="mt-1 text-sm">{userDetails.farm_size}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Number of Employees</label>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <p className="text-sm">{userDetails.employees_number}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage