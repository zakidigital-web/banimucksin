import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all events
export async function GET() {
  try {
    const events = await db.familyEvent.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data acara' }, { status: 500 });
  }
}

// POST create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, location, photos, image } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Judul acara wajib diisi' }, { status: 400 });
    }
    if (!date || !date.trim()) {
      return NextResponse.json({ success: false, error: 'Tanggal acara wajib diisi' }, { status: 400 });
    }

    const event = await db.familyEvent.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: date.trim(),
        location: location?.trim() || null,
        image: image?.trim() || null,
        photos: photos || null,
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat acara baru' }, { status: 500 });
  }
}
