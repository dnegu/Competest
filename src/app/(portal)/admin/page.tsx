import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/server/auth-actions'
import { Button } from '@/components/ui/button'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="w-full max-w-4xl p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración Global</h1>
          <form action={logout}>
            <Button variant="destructive">Cerrar Sesión</Button>
          </form>
        </div>
        <p className="text-slate-400 mb-8">Administrador: {user?.email}</p>
        <div className="p-6 bg-indigo-900/50 text-indigo-200 border border-indigo-800/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Área Restringida</h2>
          <p>
            Solo usuarios con el rol <strong>'admin'</strong> pueden acceder a esta ruta. 
            Aquí podrás gestionar tests, fórmulas y competencias globales.
          </p>
        </div>
      </div>
    </div>
  )
}
