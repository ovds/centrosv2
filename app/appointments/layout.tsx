import AuthenticatedLayout from "@/components/authenticated-layout"

export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}