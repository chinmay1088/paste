import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { title, content, format, is_public, password } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get current user (if any)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('pastes')
      .insert({
        title: title || null,
        content,
        format,
        is_public: is_public ?? true,
        user_id: user?.id || null,
        password: password || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
