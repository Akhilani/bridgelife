// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const taskId = formData.get('taskId') as string;

  if (!file || !taskId) {
    return NextResponse.json({ error: 'Missing file or taskId' }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `tasks/${taskId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_ATTACHMENTS || 'task-attachments')
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_ATTACHMENTS || 'task-attachments')
    .getPublicUrl(filePath);

  return NextResponse.json({ path: data.path, url: publicUrl });
}
