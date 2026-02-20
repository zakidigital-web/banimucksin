import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File kosong atau tidak valid' },
        { status: 400 }
      );
    }

    let imported = 0;
    let errors: string[] = [];

    // First pass: create all members (without parent/spouse links)
    const nameToIdMap = new Map<string, string>();
    const parentRequests: { name: string; parentName: string }[] = [];
    const spouseRequests: { name: string; spouseName: string }[] = [];

    // Load existing members for name matching
    const existingMembers = await db.familyMember.findMany({ select: { id: true, name: true } });
    existingMembers.forEach(m => nameToIdMap.set(m.name.toLowerCase(), m.id));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      try {
        const name = String(row['Nama Lengkap'] || '').trim();
        const genderRaw = String(row['Jenis Kelamin'] || '').trim().toLowerCase();
        const birthDate = row['Tanggal Lahir'] ? String(row['Tanggal Lahir']) : null;
        const birthPlace = row['Tempat Lahir'] ? String(row['Tempat Lahir']) : null;
        const generation = Number(row['Generasi']) || 1;
        const parentName = row['Nama Orangtua'] ? String(row['Nama Orangtua']).trim() : null;
        const spouseName = row['Nama Pasangan'] ? String(row['Nama Pasangan']).trim() : null;
        const job = row['Pekerjaan'] ? String(row['Pekerjaan']) : null;
        const address = row['Alamat'] ? String(row['Alamat']) : null;
        const phone = row['No. Telepon'] ? String(row['No. Telepon']) : null;
        const education = row['Pendidikan'] ? String(row['Pendidikan']) : null;
        const notes = row['Catatan'] ? String(row['Catatan']) : null;

        if (!name) {
          errors.push(`Baris ${rowNum}: Nama Lengkap wajib diisi`);
          continue;
        }

        // Parse gender
        let gender = 'L';
        if (genderRaw === 'perempuan' || genderRaw === 'p' || genderRaw === 'wanita') {
          gender = 'P';
        } else if (genderRaw !== 'laki-laki' && genderRaw !== 'l' && genderRaw !== 'pria') {
          if (genderRaw) {
            errors.push(`Baris ${rowNum}: Jenis kelamin tidak dikenali, menggunakan Laki-laki`);
          }
        }

        // Create member
        const created = await db.familyMember.create({
          data: {
            name,
            gender,
            birthDate,
            birthPlace,
            generation,
            job,
            address,
            phone,
            education,
            notes,
          },
        });

        nameToIdMap.set(name.toLowerCase(), created.id);

        // Queue parent/spouse linking for second pass
        if (parentName) parentRequests.push({ name, parentName });
        if (spouseName) spouseRequests.push({ name, spouseName });

        imported++;
      } catch (err) {
        console.error(`Error importing row ${rowNum}:`, err);
        errors.push(`Baris ${rowNum}: Gagal mengimport data`);
      }
    }

    // Second pass: link parents
    for (const req of parentRequests) {
      const memberId = nameToIdMap.get(req.name.toLowerCase());
      const parentId = nameToIdMap.get(req.parentName.toLowerCase());
      if (memberId && parentId) {
        try {
          await db.familyMember.update({
            where: { id: memberId },
            data: { parentId },
          });
        } catch {
          errors.push(`Gagal menghubungkan orangtua "${req.parentName}" untuk "${req.name}"`);
        }
      } else if (!parentId) {
        errors.push(`Orangtua "${req.parentName}" untuk "${req.name}" tidak ditemukan`);
      }
    }

    // Third pass: link spouses (bidirectional)
    for (const req of spouseRequests) {
      const memberId = nameToIdMap.get(req.name.toLowerCase());
      const spouseId = nameToIdMap.get(req.spouseName.toLowerCase());
      if (memberId && spouseId) {
        try {
          await db.familyMember.update({
            where: { id: memberId },
            data: { spouseId },
          });
        } catch {
          errors.push(`Gagal menghubungkan pasangan "${req.spouseName}" untuk "${req.name}"`);
        }
      } else if (!spouseId) {
        errors.push(`Pasangan "${req.spouseName}" untuk "${req.name}" tidak ditemukan`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimport ${imported} anggota`,
      imported,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengimport data' },
      { status: 500 }
    );
  }
}
