import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/server/auth-actions'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role === 'admin') {
      redirect('/admin')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portal de Clientes</h1>
          <form action={logout}>
            <Button variant="outline">Cerrar Sesión</Button>
          </form>
        </div>
        <p className="text-gray-600 mb-8">Bienvenido, {user?.email}</p>
        <div className="p-6 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold mb-2">Área de Clientes</h2>
          <p>Este es el panel principal para Clientes. Podrás gestionar procesos y candidatos aquí.</p>
        </div>
      </div>
    </div>
  )
}
