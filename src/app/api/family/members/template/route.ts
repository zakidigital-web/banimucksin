import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Create template data with example rows
    const templateData = [
      {
        'No': 1,
        'Nama Lengkap': 'Mucksin',
        'Jenis Kelamin': 'Laki-laki',
        'Tanggal Lahir': '1950-01-15',
        'Tempat Lahir': 'Jakarta',
        'Generasi': 1,
        'Nama Orangtua': '',
        'Nama Pasangan': 'Supiyah',
        'Pekerjaan': 'Pensiunan',
        'Alamat': 'Jl. Keluarga No. 1, Jakarta',
        'No. Telepon': '08123456789',
        'Pendidikan': 'S1',
        'Catatan': 'Kepala keluarga',
      },
      {
        'No': 2,
        'Nama Lengkap': 'Supiyah',
        'Jenis Kelamin': 'Perempuan',
        'Tanggal Lahir': '1955-03-20',
        'Tempat Lahir': 'Surabaya',
        'Generasi': 1,
        'Nama Orangtua': '',
        'Nama Pasangan': '',
        'Pekerjaan': 'Ibu Rumah Tangga',
        'Alamat': 'Jl. Keluarga No. 1, Jakarta',
        'No. Telepon': '08123456790',
        'Pendidikan': 'SMA',
        'Catatan': 'Istri Kepala Keluarga',
      },
      {
        'No': 3,
        'Nama Lengkap': 'Ahmad Susanto',
        'Jenis Kelamin': 'Laki-laki',
        'Tanggal Lahir': '1975-06-10',
        'Tempat Lahir': 'Jakarta',
        'Generasi': 2,
        'Nama Orangtua': 'Mucksin',
        'Nama Pasangan': 'Dewi Rahayu',
        'Pekerjaan': 'Wiraswasta',
        'Alamat': 'Jl. Merdeka No. 5, Bandung',
        'No. Telepon': '08123456791',
        'Pendidikan': 'S2',
        'Catatan': 'Anak pertama',
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create main template sheet
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 30 },  // Nama
      { wch: 12 },  // Jenis Kelamin
      { wch: 15 },  // Tanggal Lahir
      { wch: 20 },  // Tempat Lahir
      { wch: 10 },  // Generasi
      { wch: 25 },  // Nama Orangtua
      { wch: 25 },  // Nama Pasangan
      { wch: 25 },  // Pekerjaan
      { wch: 40 },  // Alamat
      { wch: 15 },  // No. Telepon
      { wch: 20 },  // Pendidikan
      { wch: 30 },  // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template Anggota');

    // Create instruction sheet
    const instructions = [
      { 'Petunjuk Pengisian Template': '' },
      { '': '' },
      { 'Kolom': 'Keterangan' },
      { 'No': 'Nomor urut (otomatis oleh sistem)' },
      { 'Nama Lengkap': 'Nama lengkap anggota keluarga (WAJIB DIISI)' },
      { 'Jenis Kelamin': 'Pilih: Laki-laki atau Perempuan (WAJIB DIISI)' },
      { 'Tanggal Lahir': 'Format: YYYY-MM-DD (contoh: 1990-05-15)' },
      { 'Tempat Lahir': 'Kota/kabupaten tempat lahir' },
      { 'Generasi': 'Angka generasi (1, 2, 3, dst). Generasi 1 = Kepala keluarga' },
      { 'Nama Orangtua': 'Nama orangtua dari daftar anggota (harus sama persis)' },
      { 'Nama Pasangan': 'Nama pasangan/suami/istri dari daftar anggota (harus sama persis)' },
      { 'Pekerjaan': 'Pekerjaan saat ini' },
      { 'Alamat': 'Alamat lengkap saat ini' },
      { 'No. Telepon': 'Nomor telepon/HP (untuk WhatsApp)' },
      { 'Pendidikan': 'Pendidikan terakhir' },
      { 'Catatan': 'Catatan tambahan' },
      { '': '' },
      { 'CATATAN PENTING:': '' },
      { '1. Kolom Nama Lengkap dan Jenis Kelamin wajib diisi': '' },
      { '2. Format tanggal harus YYYY-MM-DD': '' },
      { '3. Jenis Kelamin harus "Laki-laki" atau "Perempuan"': '' },
      { '4. Generasi diisi dengan angka (1, 2, 3, dst)': '' },
      { '5. Nama Orangtua dan Pasangan harus sesuai dengan nama yang ada': '' },
      { '6. Hapus baris contoh sebelum import': '' },
      { '7. Cukup isi Nama Pasangan di salah satu pihak saja': '' },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 40 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template-anggota-keluarga.xlsx"',
      },
    });
  } catch (error) {
    console.error('Template error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat template' },
      { status: 500 }
    );
  }
}
