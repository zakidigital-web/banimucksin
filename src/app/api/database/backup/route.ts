import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Export/Backup all data as JSON
export async function GET() {
  try {
    // Fetch all data from all tables
    const members = await db.familyMember.findMany({
      include: {
        children: true,
      },
    });
    
    const gallery = await db.gallery.findMany();
    const events = await db.familyEvent.findMany();
    const familyInfo = await db.familyInfo.findFirst();
    const adminUsers = await db.adminUser.findMany({
      select: { id: true, username: true, name: true, createdAt: true },
    });

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Bani Mucksin - Silsilah Keluarga',
      data: {
        familyInfo,
        members,
        gallery,
        events,
        adminUsers,
      },
    };

    return NextResponse.json({
      success: true,
      data: backup,
      message: 'Backup berhasil dibuat',
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat backup' }, { status: 500 });
  }
}
