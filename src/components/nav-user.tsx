"use client"

import {
    IconBell,
    IconBellOff,
    IconDotsVertical,
    IconLogout,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/client"

interface User {
  id: string
  name: string
  email: string
  avatar: string
  username?: string
  role?: string
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const handleNotificationRequest = async () => {
    try {
      // Check if we're on client side
      if (typeof window === 'undefined') return
      
      // Dynamic import to ensure client-side only
      const { browserNotificationService } = await import('@/utils/pushNotification')
      
      const hasPermission = await browserNotificationService.requestPermission()
      if (hasPermission) {
        // Subscribe to push notifications
        const subscribed = await browserNotificationService.subscribeToPush()
        if (subscribed) {
          setNotificationPermission('granted')
          // Test notification
          await browserNotificationService.showNotification({
            title: 'Push Notifications Enabled!',
            body: 'You will now receive push notifications for order updates.',
            icon: '/icon-192x192.png'
          })
        } else {
          setNotificationPermission('denied')
        }
      } else {
        setNotificationPermission('denied')
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Auth error:', authError)
        router.push('/login') 
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('userid, username, email, role_id')
        .eq('userid', authUser.id)
        .single()

      if (userError) {
        console.error('User data error:', userError)
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || '',
        })
      } else {
        setUser({
          id: userData.userid,
          name: userData.username || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: userData.email || authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || '',
          username: userData.username,
          role: userData.role_id?.toString(),
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('Failed to logout. Please try again.')
        return
      }
      
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="text-muted-foreground">Not logged in</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Notification Permission - Only show on client side */}
            {typeof window !== 'undefined' && 'Notification' in window && (
              <>
                {notificationPermission === 'default' && (
                  <DropdownMenuItem 
                    onClick={handleNotificationRequest}
                    className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                  >
                    <IconBell />
                    Enable Notifications
                  </DropdownMenuItem>
                )}
                
                {notificationPermission === 'denied' && (
                  <DropdownMenuItem 
                    disabled
                    className="text-gray-400 cursor-not-allowed"
                  >
                    <IconBellOff />
                    Notifications Blocked
                  </DropdownMenuItem>
                )}
                
                {notificationPermission === 'granted' && (
                  <DropdownMenuItem 
                    disabled
                    className="text-green-600"
                  >
                    <IconBell />
                    Notifications Enabled
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavUserWithProps({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('Failed to logout. Please try again.')
        return
      }
      
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}