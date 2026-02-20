import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all family members
    const members = await db.familyMember.findMany({
      include: {
        children: true,
      },
      orderBy: [{ generation: 'asc' }, { name: 'asc' }],
    });

    // Get family info
    let familyInfo = await db.familyInfo.findFirst();

    if (!familyInfo) {
      familyInfo = {
        id: 'default',
        familyName: 'Bani Mucksin / Supiyah',
        description: 'Keluarga besar Bani Mucksin / Supiyah yang menjalin tali silaturahmi antar generasi.',
        history: null,
        vision: null,
        mission: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Get gallery
    const gallery = await db.gallery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Get events
    const events = await db.familyEvent.findMany({
      orderBy: { date: 'asc' },
    });

    // Calculate stats
    const totalMembers = members.length;
    const generations = new Set(members.map(m => m.generation)).size;
    const maleCount = members.filter(m => m.gender === 'L').length;
    const femaleCount = members.filter(m => m.gender === 'P').length;

    // Collect all spouseIds — these members are shown as part of their couple node
    const spouseIds = new Set(members.filter(m => m.spouseId).map(m => m.spouseId!));

    // Build spouse relationships
    const membersWithSpouse = members.map(member => {
      const spouse = member.spouseId
        ? members.find(m => m.id === member.spouseId)
        : null;
      return {
        ...member,
        spouse,
      };
    });

    // Build tree structure recursively, excluding spouses (they appear inside couple nodes)
    function buildTree(parentId: string | null): any[] {
      return membersWithSpouse
        .filter(m => m.parentId === parentId && !spouseIds.has(m.id))
        .map(member => ({
          ...member,
          children: buildTree(member.id),
        }));
    }

    const treeData = buildTree(null);

    return NextResponse.json({
      success: true,
      data: {
        members: membersWithSpouse,
        rootMembers: treeData,
        familyInfo,
        gallery,
        events,
        stats: {
          totalMembers,
          generations,
          maleCount,
          femaleCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching family data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch family data' },
      { status: 500 }
    );
  }
}
