import { SupabaseAdminAuthProvider } from "@/context/supabase-admin-auth-context"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseAdminAuthProvider>
      {children}
    </SupabaseAdminAuthProvider>
  )
}