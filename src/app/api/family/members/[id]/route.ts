import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await db.familyMember.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch member' }, { status: 500 });
  }
}

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, gender, birthDate, birthPlace, photo, parentId, spouseId, generation, job, address, phone, education, notes, isActive } = body;

    const member = await db.familyMember.update({
      where: { id },
      data: {
        name,
        gender,
        birthDate: birthDate || null,
        birthPlace: birthPlace || null,
        photo: photo || null,
        parentId: parentId || null,
        spouseId: spouseId || null,
        generation: generation || 1,
        job: job || null,
        address: address || null,
        phone: phone || null,
        education: education || null,
        notes: notes || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First, set spouseId of the spouse to null if exists
    const member = await db.familyMember.findUnique({
      where: { id },
    });
    
    if (member?.spouseId) {
      await db.familyMember.update({
        where: { id: member.spouseId },
        data: { spouseId: null },
      });
    }
    
    // Update children to have no parent
    await db.familyMember.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    // Delete the member
    await db.familyMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete member' }, { status: 500 });
  }
}
