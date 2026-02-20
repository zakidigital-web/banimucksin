import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Reset/Clear all data
export async function POST() {
  try {
    // Clear all tables
    await db.gallery.deleteMany({});
    await db.familyEvent.deleteMany({});
    
    // Delete members (remove relationships first)
    const members = await db.familyMember.findMany();
    for (const member of members) {
      await db.familyMember.update({
        where: { id: member.id },
        data: { parentId: null, spouseId: null },
      });
    }
    await db.familyMember.deleteMany({});
    await db.familyInfo.deleteMany({});

    // Recreate default family info
    await db.familyInfo.create({
      data: {
        familyName: 'Bani Mucksin / Supiyah',
        description: 'Keluarga besar Bani Mucksin / Supiyah yang menjalin tali silaturahmi antar generasi.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Semua data berhasil dihapus',
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
  }
}
