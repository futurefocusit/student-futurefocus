"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Users,
  Clock,
  DollarSign,
  CalendarDays,
  Briefcase,
  UserCheck,
} from "lucide-react"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { User } from "@/types/types"
import { useAuth } from "@/context/AuthContext"
import SideBar from "@/components/SideBar"
import Loader from "@/components/loader"

export default function Component() {
  const [userData, setUserData] = useState<User>()
  const {loggedUser, loading}= useAuth()
  const handleProfileUpdate = (updatedData: Partial<User>) => {
    setUserData((prev) => ({ ...prev, ...updatedData }))
  }
  if(loading){
    return(
      <div>
        <Loader/>
      </div>
    )
  }

 if(!loggedUser && !loading){
  return(
    <div>
      no user found
    </div>
  )
 }

  return (
      <><SideBar /><div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="relative">
          {/* Cover Image */}
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg" />

          {/* Profile Info */}
          <div className="relative pt-16 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={loggedUser.image} alt="Profile" />
                <AvatarFallback className="text-2xl">{loggedUser.name}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-3xl font-bold">{loggedUser.name}</h1>
                  <p className="text-muted-foreground">{loggedUser.position}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {loggedUser.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {loggedUser.skills.length > 3 && <Badge variant="outline">+{loggedUser.skills.length - 3} more</Badge>}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{loggedUser.bio}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{loggedUser.salary.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{loggedUser.currency} Salary</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{loggedUser.days.split(',').length}</div>
              <div className="text-sm text-muted-foreground">Work Days / Per Week</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${loggedUser.leaveDetails.isOnLeave ? "text-red-500": "text-green-500"}`}>{loggedUser.leaveDetails.isOnLeave ? 'On Leave' : "Active"}</div>
              <div className="text-sm text-muted-foreground">Working Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{loggedUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{loggedUser.phone}</span>
                </div>
                {/* <div className="flex items-center gap-3">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <span>{loggedUser.location}</span>
    </div> */}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Social Links</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div className="flex items-center gap-3">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <a href={loggedUser.website} className="text-blue-600 hover:underline">
        {loggedUser.website}
      </a>
    </div> */}

                {/* <div className="flex items-center gap-3">
      <Github className="w-4 h-4 text-muted-foreground" />
      <a href={`https://${loggedUser.github}`} className="text-blue-600 hover:underline">
        {loggedUser.github}
      </a>
    </div> */}

                <div className="flex items-center gap-3">
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`https://instagram.com/${loggedUser.instagram.replace("@", "")}`}
                    className="text-blue-600 hover:underline"
                  >
                    {loggedUser.instagram}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <a href={`https://${loggedUser.linkedIn}`} className="text-blue-600 hover:underline">
                    {loggedUser.linkedIn}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {loggedUser.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{loggedUser.position}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Joined Date:</span>
                    <span className="font-medium">{loggedUser.dateJoined}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span className="font-medium">{loggedUser.paymentDate}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {loggedUser.salary.toLocaleString()} {loggedUser.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Work Schedule
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entry Time:</span>
                    <span className="font-medium">{loggedUser.entry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Exit Time:</span>
                    <span className="font-medium">{loggedUser.exit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Daily Hours:</span>
                    <span className="font-medium">12 hours</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Working Days</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${loggedUser.days.includes(day) ? "bg-green-500" : "bg-gray-300"}`} />
                        <span
                          className={loggedUser.days.includes(day) ? "text-foreground" : "text-muted-foreground"}
                        >
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Current Leave Details
              </h3>
            </CardHeader>
            {loggedUser.leaveDetails.isOnLeave && (

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Starting From:</span>
                      <span className="font-medium">{loggedUser.leaveDetails.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ending To:</span>
                      <span className="font-medium">{loggedUser.leaveDetails.endDate}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="destructive">{loggedUser.leaveDetails.isOnLeave ? 'On leave ' : "Active"}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div></>
  )
}
