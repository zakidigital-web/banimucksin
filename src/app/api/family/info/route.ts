import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET family info
export async function GET() {
  try {
    let familyInfo = await db.familyInfo.findFirst();
    
    if (!familyInfo) {
      // Create default family info if not exists
      familyInfo = await db.familyInfo.create({
        data: {
          familyName: 'Bani Mucksin / Supiyah',
          description: 'Keluarga besar Bani Mucksin / Supiyah yang menjalin tali silaturahmi antar generasi.',
        },
      });
    }
    
    return NextResponse.json({ success: true, data: familyInfo });
  } catch (error) {
    console.error('Error fetching family info:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch family info' }, { status: 500 });
  }
}

// PUT update family info
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { familyName, description, history, vision, mission, logo } = body;

    let familyInfo = await db.familyInfo.findFirst();

    if (familyInfo) {
      familyInfo = await db.familyInfo.update({
        where: { id: familyInfo.id },
        data: {
          familyName,
          description: description || null,
          history: history || null,
          vision: vision || null,
          mission: mission || null,
          logo: logo || null,
        },
      });
    } else {
      familyInfo = await db.familyInfo.create({
        data: {
          familyName,
          description: description || null,
          history: history || null,
          vision: vision || null,
          mission: mission || null,
          logo: logo || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: familyInfo });
  } catch (error) {
    console.error('Error updating family info:', error);
    return NextResponse.json({ success: false, error: 'Failed to update family info' }, { status: 500 });
  }
}
