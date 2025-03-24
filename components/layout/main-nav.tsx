"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, Home, MessageSquare, Users } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "NUS High",
      icon: null,
      active: pathname === "/",
      className: "mr-6 font-bold text-lg hidden lg:flex items-center"
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/appointments",
      label: "Appointments",
      icon: Calendar,
      active: pathname === "/appointments",
    },
    {
      href: "/resources",
      label: "Resources",
      icon: BookOpen,
      active: pathname === "/resources",
    },
    {
      href: "/forum",
      label: "Forum",
      icon: MessageSquare,
      active: pathname === "/forum",
    },
    {
      href: "/counsellors",
      label: "Counsellors",
      icon: Users,
      active: pathname === "/counsellors",
    },
  ]

  return (
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {routes.map((route) => {
          if (!route.icon) {
            return (
                <Link
                    key={route.href}
                    href={route.href}
                    className={route.className}
                >
                  {route.label}
                </Link>
            )
          }

          return (
              <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-primary",
                      route.active ? "text-primary" : "text-muted-foreground",
                      "whitespace-nowrap"
                  )}
              >
                {route.icon && <route.icon className="mr-2 h-4 w-4" />}
                {route.label}
              </Link>
          )
        })}
      </nav>
  )
}