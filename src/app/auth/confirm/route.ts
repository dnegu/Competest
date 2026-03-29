import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // PKCE flow (default in new Supabase projects)
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const nextUrl = request.nextUrl.clone()
      nextUrl.pathname = next
      nextUrl.searchParams.delete('code')
      return NextResponse.redirect(nextUrl)
    }
  } else if (token_hash && type) {
    // Legacy Implicit flow
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      const nextUrl = request.nextUrl.clone()
      nextUrl.pathname = next
      nextUrl.searchParams.delete('token_hash')
      nextUrl.searchParams.delete('type')
      return NextResponse.redirect(nextUrl)
    }
  }

  // Verification failed, return to login with error
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/login'
  errorUrl.searchParams.set('error', 'auth-invalid-link')
  return NextResponse.redirect(errorUrl)
}
