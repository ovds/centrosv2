import { AdminAuthProvider } from "@/context/admin-auth-context"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  )
}