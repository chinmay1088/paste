import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: paste, error } = await supabase
      .from('pastes')
      .select('password')
      .eq('id', id)
      .single()

    if (error || !paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }

    if (!paste.password) {
      return NextResponse.json({ error: 'Paste is not password protected' }, { status: 400 })
    }

    if (paste.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
