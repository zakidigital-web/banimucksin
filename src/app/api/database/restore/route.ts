import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Restore data from backup JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ success: false, error: 'Data backup tidak ditemukan' }, { status: 400 });
    }

    // Start transaction-like operations
    // Note: SQLite doesn't support all transactions well, so we do sequential operations

    // 1. Clear existing data (except admin users)
    await db.gallery.deleteMany({});
    await db.familyEvent.deleteMany({});
    
    // Delete members in order (children first due to foreign key constraints)
    const members = await db.familyMember.findMany();
    for (const member of members) {
      await db.familyMember.update({
        where: { id: member.id },
        data: { parentId: null, spouseId: null },
      });
    }
    await db.familyMember.deleteMany({});
    await db.familyInfo.deleteMany({});

    // 2. Restore family info
    if (data.familyInfo) {
      await db.familyInfo.create({
        data: {
          familyName: data.familyInfo.familyName || 'Bani Mucksin',
          description: data.familyInfo.description || null,
          history: data.familyInfo.history || null,
          vision: data.familyInfo.vision || null,
          mission: data.familyInfo.mission || null,
          logo: data.familyInfo.logo || null,
        },
      });
    }

    // 3. Restore members (without relationships first)
    if (data.members && Array.isArray(data.members)) {
      for (const member of data.members) {
        await db.familyMember.create({
          data: {
            id: member.id,
            name: member.name,
            gender: member.gender,
            birthDate: member.birthDate || null,
            birthPlace: member.birthPlace || null,
            photo: member.photo || null,
            generation: member.generation || 1,
            job: member.job || null,
            address: member.address || null,
            phone: member.phone || null,
            education: member.education || null,
            notes: member.notes || null,
            isActive: member.isActive ?? true,
            parentId: null, // Will update later
            spouseId: null, // Will update later
          },
        });
      }

      // Update relationships
      for (const member of data.members) {
        if (member.parentId || member.spouseId) {
          await db.familyMember.update({
            where: { id: member.id },
            data: {
              parentId: member.parentId || null,
              spouseId: member.spouseId || null,
            },
          });
        }
      }
    }

    // 4. Restore gallery
    if (data.gallery && Array.isArray(data.gallery)) {
      for (const item of data.gallery) {
        await db.gallery.create({
          data: {
            id: item.id,
            title: item.title,
            description: item.description || null,
            imageUrl: item.imageUrl,
            category: item.category || 'family',
            date: item.date || null,
            memberIds: item.memberIds || null,
          },
        });
      }
    }

    // 5. Restore events
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        await db.familyEvent.create({
          data: {
            id: event.id,
            title: event.title,
            description: event.description || null,
            date: event.date,
            location: event.location || null,
            photos: event.photos || null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dipulihkan',
      stats: {
        members: data.members?.length || 0,
        gallery: data.gallery?.length || 0,
        events: data.events?.length || 0,
      },
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memulihkan data: ' + (error as Error).message }, { status: 500 });
  }
}
