import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await db.familyEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, date, location, photos, image } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Judul acara wajib diisi' }, { status: 400 });
    }
    if (!date || !date.trim()) {
      return NextResponse.json({ success: false, error: 'Tanggal acara wajib diisi' }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await db.familyEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Acara tidak ditemukan' }, { status: 404 });
    }

    const event = await db.familyEvent.update({
      where: { id },
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
    console.error('Error updating event:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengupdate acara' }, { status: 500 });
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.familyEvent.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
