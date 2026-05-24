import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await query('SELECT * FROM public.projects WHERE id = $1', [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // We update fields that are provided
    const fields = [];
    const values = [];
    let queryStr = `UPDATE public.projects SET updated_at = CURRENT_TIMESTAMP`;
    
    if (body.idea !== undefined) {
      values.push(body.idea);
      queryStr += `, idea = $${values.length}`;
    }
    if (body.answers !== undefined) {
      values.push(body.answers ? JSON.stringify(body.answers) : null);
      queryStr += `, answers = $${values.length}`;
    }
    if (body.prd_result !== undefined) {
      values.push(body.prd_result);
      queryStr += `, prd_result = $${values.length}`;
    }
    if (body.user_id !== undefined) {
      values.push(body.user_id);
      queryStr += `, user_id = $${values.length}`;
    }

    queryStr += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    const res = await query(queryStr, values);
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
