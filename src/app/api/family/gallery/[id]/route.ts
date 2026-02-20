import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gallery = await db.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery item' }, { status: 500 });
  }
}

// PUT update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, imageUrl, category, date, memberIds } = body;

    const gallery = await db.gallery.update({
      where: { id },
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
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update gallery item' }, { status: 500 });
  }
}

// DELETE gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.gallery.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
