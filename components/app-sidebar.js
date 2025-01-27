"use client"

import {
  Activity,
  Boxes,
  ClipboardList,
  Home,
  ShieldAlert,
} from 'lucide-react'
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Overview and Analytics",
  },
  {
    title: "Devices",
    url: "/dashboard/devices",
    icon: Boxes,
    description: "IoT Device Management",
  },
  {
    title: "Test Cases",
    url: "/dashboard/testcases",
    icon: ClipboardList,
    description: "Test Case Management",
  },
  {
    title: "Test Results",
    url: "/dashboard/testresults",
    icon: Activity,
    description: "Test Execution Results",
  },
  {
    title: "Vulnerabilities",
    url: "/dashboard/vulnerabilities",
    icon: ShieldAlert,
    description: "Security Vulnerabilities",
  }
]

export function AppSidebar() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signIn")
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  const getInitials = () => {
    if (!session?.user?.name) return "U"
    return session.user.name.charAt(0).toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldAlert className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-semibold tracking-tight">IoT Health Secure</h1>
            <p className="text-xs text-muted-foreground">Testing Framework</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.description}
                    className="gap-3"
                  >
                    <a href={item.url}>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="size-4" />
                      </div>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-3 px-3 py-2"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {session?.user?.name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[--radix-popper-anchor-width]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
