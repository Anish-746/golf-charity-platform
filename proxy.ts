// middleware.ts — final complete version
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — protect private routes
  if (!user) {
    if (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/admin')
    ) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Fetch role AND subscription_status in one query
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const subStatus = profile?.subscription_status

  // Admin routing
  if (isAdmin && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  if (!isAdmin && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // PRD Section 04: real-time subscription check on every request.
  // Inactive/lapsed subscribers are redirected to /subscribe.
  // Allow /subscribe itself through so they can actually re-subscribe.
  // Allow /dashboard itself through so they see the inactive state UI.
  // Only block deeper dashboard sub-routes that require active subscription.
  const isSubscriptionProtected =
    request.nextUrl.pathname.startsWith('/dashboard') &&
    request.nextUrl.pathname !== '/dashboard'  // allow root dashboard, block sub-pages

  if (
    !isAdmin &&
    isSubscriptionProtected &&
    subStatus !== 'active'
  ) {
    return NextResponse.redirect(
      new URL('/subscribe?reason=inactive', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}