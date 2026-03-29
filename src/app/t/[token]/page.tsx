import { validateTokenAndFetchContext } from '@/features/test-engine/server/test-actions'
import { TestContainer } from '@/features/test-engine/ui/TestContainer'

interface CandidatePageProps {
  params: Promise<{ token: string }>
}

export default async function CandidateTestPage({ params }: CandidatePageProps) {
  // Fetch candidate token from url strictly server-side
  const { token } = await params
  
  const { data: context, error } = await validateTokenAndFetchContext(token)

  if (error || !context) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full p-8 text-center bg-white border border-red-100 rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">{error || 'Token inválido'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TestContainer context={context} />
    </div>
  )
}
