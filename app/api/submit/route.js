import { NextResponse } from 'next/server';
import { getSupabaseServer } from '../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServer();

    // If a file is included (base64 data URI), upload to storage
    let file_url = null;
    if (body.fileData && body.fileName) {
      const matches = body.fileData.match(/^data:(.+);base64,(.*)$/);
      if (matches) {
        const mime = matches[1];
        const b64 = matches[2];
        const buffer = Buffer.from(b64, 'base64');
        const safeName = `${Date.now()}_${body.fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        const { data, error } = await supabase.storage.from('submissions').upload(safeName, buffer, { contentType: mime });
        if (error) console.warn('Storage upload error', error);
        else {
          // public URL (quick demo)
          file_url = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${data.path || safeName}`;
        }
      }
    }

    const insert = {
      type: body.type ?? null,
      title: body.title ?? null,
      details: body.details ?? null,
      anonymous: !!body.anonymous,
      name: body.name ?? null,
      grade: body.grade ?? null,
      location: body.location ?? null,
      urgent: !!body.urgent,
      file_url,
      file_name: body.fileName ?? null,
      submitted_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('submissions').insert(insert);
    if (error) {
      console.error('Insert error', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
