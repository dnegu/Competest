import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950">
      <div className="z-10 max-w-sm w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Competest</h1>
        <p className="text-slate-400 mb-8">Gestión de talento y motor psicométrico avanzado.</p>
        <a 
          href="/login" 
          className="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
        >
          Ir al Login
        </a>
      </div>
    </main>
  )
}
