'use client'

import { useState } from 'react'
import { loginWithMagicLink } from '@/features/auth/server/auth-actions'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // In dev, use localhost. In prod, use real URL
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const res = await loginWithMagicLink(email, `${origin}/auth/confirm`)
    
    if (res?.error) {
      setMessage(`Error: ${res.error}`)
    } else {
      setMessage('Un enlace mágico ha sido enviado a tu correo.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900 tracking-tight">Competest</h1>
        <p className="text-center text-sm text-gray-500">
          Ingresa tu correo para recibir un enlace mágico de acceso.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6 mt-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm p-3 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="admin@empresa.com"
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? 'Enviando enlace...' : 'Ingresar'}
          </Button>
          
          {message && (
            <p className={`text-sm text-center mt-4 font-medium ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
