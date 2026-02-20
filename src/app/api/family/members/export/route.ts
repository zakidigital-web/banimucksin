import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const members = await db.familyMember.findMany({
      orderBy: [{ generation: 'asc' }, { name: 'asc' }],
    });

    // Prepare data for Excel
    const data = members.map((member, index) => ({
      'No': index + 1,
      'Nama Lengkap': member.name,
      'Jenis Kelamin': member.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tanggal Lahir': member.birthDate || '',
      'Tempat Lahir': member.birthPlace || '',
      'Generasi': member.generation,
      'Pekerjaan': member.job || '',
      'Alamat': member.address || '',
      'No. Telepon': member.phone || '',
      'Pendidikan': member.education || '',
      'Catatan': member.notes || '',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 30 },  // Nama
      { wch: 12 },  // Jenis Kelamin
      { wch: 15 },  // Tanggal Lahir
      { wch: 20 },  // Tempat Lahir
      { wch: 10 },  // Generasi
      { wch: 25 },  // Pekerjaan
      { wch: 40 },  // Alamat
      { wch: 15 },  // No. Telepon
      { wch: 20 },  // Pendidikan
      { wch: 30 },  // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Anggota Keluarga');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="anggota-keluarga-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengekspor data' },
      { status: 500 }
    );
  }
}
