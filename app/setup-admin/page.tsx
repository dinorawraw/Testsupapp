import { CreateAdminUser } from "@/components/admin/create-admin-user"

export default function SetupAdminPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Configuração Inicial</h1>
      <CreateAdminUser />
    </div>
  )
}
