"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, Calendar, Lock, ExternalLink, Camera, Shield, Bell } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [fullName, setFullName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize the form with user data once it's loaded
  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName)
    }
  }, [user?.fullName])

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)
      // This would actually update the user's name via Clerk's API
      await user?.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" ")
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U"
  }

  const formatDate = (date: Date | string | undefined | null) => {
      if (!date) return "N/A"
      const parsedDate = typeof date === "string" ? new Date(date) : date
      return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-4 border-background">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback className="text-3xl bg-primary/10">{getInitials(user?.fullName || "")}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full h-8 w-8 p-0 shadow-md"
              onClick={() => window.open(user?.imageUrl, "_blank")}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change profile picture</span>
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold mt-4">{user?.fullName}</h1>
        <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Joined {formatDate(user?.createdAt)}</span>
        </div>
      </div>
      
      <Card className="max-w-4xl mx-auto shadow-lg border-primary/10">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="account" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> 
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> 
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-6">
            <TabsContent value="account" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the name that will be displayed on your profile
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user?.primaryEmailAddress?.emailAddress || ""} 
                    disabled 
                    className="w-full bg-muted/50"
                  />
                  <div className="flex items-center text-xs">
                    <Lock className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-muted-foreground">Email verified</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col p-3 rounded-md bg-accent/50">
                    <span className="text-muted-foreground">Last sign in</span>
                    <span className="font-medium">{formatDate(user?.lastSignInAt)}</span>
                  </div>
                  <div className="flex flex-col p-3 rounded-md bg-accent/50">
                    <span className="text-muted-foreground">Account created</span>
                    <span className="font-medium">{formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setFullName(user?.fullName || "")}
                  disabled={isUpdating}
                >
                  Reset
                </Button>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdating || fullName === user?.fullName || !fullName.trim()}
                  className="min-w-[120px]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="space-y-6">
                <div className="bg-primary/5 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Notification preferences will be available soon. You'll be able to customize
                    which notifications you receive and how they are delivered.
                  </p>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}