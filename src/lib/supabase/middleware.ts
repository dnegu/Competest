import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = null;
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData) {
      userRole = userData.role
    }
  }

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')

  // Magic Link auto-recovery for missing Supabase UI whitelists
  const code = request.nextUrl.searchParams.get('code')
  if (code && !pathname.startsWith('/auth/confirm')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/confirm'
    return NextResponse.redirect(url)
  }  if (!user && !isAuthRoute) {
    // Redirect unauthenticated users to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // Redirect authenticated users away from login page
    const url = request.nextUrl.clone()
    url.pathname = userRole === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Role-based protection example
  if (user && pathname.startsWith('/admin') && userRole !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Set role header for the app to access easily
  if (userRole) {
    supabaseResponse.headers.set('x-user-role', userRole)
  }

  return supabaseResponse
}
