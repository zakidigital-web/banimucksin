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

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row (accounting for header)

      try {
        // Get values
        const name = String(row['Nama Lengkap'] || '').trim();
        const genderRaw = String(row['Jenis Kelamin'] || '').trim().toLowerCase();
        const birthDate = row['Tanggal Lahir'] ? String(row['Tanggal Lahir']) : null;
        const birthPlace = row['Tempat Lahir'] ? String(row['Tempat Lahir']) : null;
        const generation = Number(row['Generasi']) || 1;
        const job = row['Pekerjaan'] ? String(row['Pekerjaan']) : null;
        const address = row['Alamat'] ? String(row['Alamat']) : null;
        const phone = row['No. Telepon'] ? String(row['No. Telepon']) : null;
        const education = row['Pendidikan'] ? String(row['Pendidikan']) : null;
        const notes = row['Catatan'] ? String(row['Catatan']) : null;

        // Validate required fields
        if (!name) {
          errors.push(`Baris ${rowNum}: Nama Lengkap wajib diisi`);
          continue;
        }

        // Parse gender
        let gender = 'L';
        if (genderRaw === 'perempuan' || genderRaw === 'p' || genderRaw === 'wanita') {
          gender = 'P';
        } else if (genderRaw !== 'laki-laki' && genderRaw !== 'l' && genderRaw !== 'pria') {
          // Default to L if not recognized, but log a warning
          if (genderRaw) {
            errors.push(`Baris ${rowNum}: Jenis kelamin tidak dikenali, menggunakan Laki-laki`);
          }
        }

        // Create member
        await db.familyMember.create({
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

        imported++;
      } catch (err) {
        console.error(`Error importing row ${rowNum}:`, err);
        errors.push(`Baris ${rowNum}: Gagal mengimport data`);
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
