import React from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  )
}