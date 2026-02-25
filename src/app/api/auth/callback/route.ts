import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard';
    const type = searchParams.get('type');

    console.log('[Auth Callback] Code present:', !!code, 'Type:', type, 'Next:', next);

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            if (type === 'invite' || type === 'recovery' || next === '/auth/set-password') {
                return NextResponse.redirect(`${origin}/auth/set-password`);
            }
            // Check if user came from an invite by looking at session or metadata
            const { data: { user } } = await supabase.auth.getUser();
            // If user has no password setup, or was just invited
            // Sometimes we just rely on type === 'invite'

            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error('[Auth Callback] Error exchanging code:', error);
        }
    }

    // If no code is present but type is invite, it might be implicit flow
    // We handle implicit flow client-side on the page they land on, 
    // but if they hit the callback without code, we redirect them to home
    return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error`);
}
