import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = (await params) as { id: string };
  const { status, receiptUrl } = await req.json();

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing Bearer token' }, { status: 401 });
  }

  if (!id || !status) {
    return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: {
			Authorization: `Bearer ${token}`,
			},
		},
	})

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('salary_payments')
    .update({
      payment_status: status,
      receipt_url: receiptUrl ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Salary payment not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: `Salary ${id} marked as ${status}`,
    receiptUrl
  });
}