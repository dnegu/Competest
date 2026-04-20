import { createClient } from '@/lib/supabase/server'

export default async function DebugAuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let roleFromDB = null
  let dbError = null

  if (user) {
    const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
    roleFromDB = data?.role
    dbError = error
  }

  return (
    <div className="p-10 bg-slate-900 text-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Debug Auth State</h1>
      <pre className="bg-slate-800 p-4 rounded border border-slate-700 overflow-auto">
        {JSON.stringify({
          user_id: user?.id,
          user_email: user?.email,
          role_from_db: roleFromDB,
          db_error: dbError,
          raw_data: user
        }, null, 2)}
      </pre>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Instrucciones:</h2>
        <p className="text-slate-400">
          Si "role_from_db" es null pero en Supabase ves 'admin', 
          el problema es que el cliente de Supabase no tiene permisos para leer la tabla `users`.
        </p>
      </div>
    </div>
  )
}
