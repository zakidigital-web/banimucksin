import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all gallery items
export async function GET() {
  try {
    const gallery = await db.gallery.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

// POST create new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, category, date, memberIds } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ success: false, error: 'Title and image URL are required' }, { status: 400 });
    }

    const gallery = await db.gallery.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        category: category || 'family',
        date: date || null,
        memberIds: memberIds || null,
      },
    });

    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create gallery item' }, { status: 500 });
  }
}
