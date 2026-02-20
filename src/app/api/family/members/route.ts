import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all members
export async function GET() {
  try {
    const members = await db.familyMember.findMany({
      include: {
        children: true,
      },
      orderBy: [{ generation: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gender, birthDate, birthPlace, photo, parentId, spouseId, generation, job, address, phone, education, notes } = body;

    if (!name || !gender) {
      return NextResponse.json({ success: false, error: 'Name and gender are required' }, { status: 400 });
    }

    const member = await db.familyMember.create({
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
      },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ success: false, error: 'Failed to create member' }, { status: 500 });
  }
}
