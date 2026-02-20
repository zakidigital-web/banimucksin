import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Seed initial data
export async function POST() {
  try {
    // Check if data already exists
    const existingMembers = await db.familyMember.count();
    if (existingMembers > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already exists' 
      });
    }

    // Create family info
    await db.familyInfo.create({
      data: {
        familyName: 'Bani Mucksin / Supiyah',
        description: 'Keluarga besar Bani Mucksin / Supiyah yang menjalin tali silaturahmi antar generasi dengan penuh cinta dan kasih sayang.',
        history: 'Keluarga Bani Mucksin / Supiyah didirikan oleh pasangan Mucksin dan Supiyah. Dari pernikahan mereka, lahir anak-anak yang kemudian melanjutkan keturunan hingga generasi saat ini.',
        vision: 'Menjadi keluarga yang harmonis, sukses, dan selalu menjaga tali silaturahmi antar generasi.',
        mission: 'Mempererat hubungan keluarga, saling mendukung dalam kebaikan, dan melestarikan nilai-nilai keluarga.',
      },
    });

    // Create sample family members (root)
    const ayah = await db.familyMember.create({
      data: {
        name: 'Mucksin',
        gender: 'L',
        birthDate: '1940-01-15',
        birthPlace: 'Jawa Tengah',
        generation: 1,
        job: 'Petani',
        address: 'Jawa Tengah',
      },
    });

    const ibu = await db.familyMember.create({
      data: {
        name: 'Supiyah',
        gender: 'P',
        birthDate: '1945-03-20',
        birthPlace: 'Jawa Tengah',
        generation: 1,
        address: 'Jawa Tengah',
      },
    });

    // Update spouse relationships
    await db.familyMember.update({
      where: { id: ayah.id },
      data: { spouseId: ibu.id },
    });

    // Create children (Generation 2)
    const anak1 = await db.familyMember.create({
      data: {
        name: 'Ahmad Susanto',
        gender: 'L',
        birthDate: '1965-06-10',
        birthPlace: 'Jawa Tengah',
        parentId: ayah.id,
        generation: 2,
        job: 'Wiraswasta',
        address: 'Jakarta',
      },
    });

    const anak2 = await db.familyMember.create({
      data: {
        name: 'Siti Aminah',
        gender: 'P',
        birthDate: '1968-08-25',
        birthPlace: 'Jawa Tengah',
        parentId: ayah.id,
        generation: 2,
        job: 'Guru',
        address: 'Semarang',
      },
    });

    const anak3 = await db.familyMember.create({
      data: {
        name: 'Budi Santoso',
        gender: 'L',
        birthDate: '1972-12-05',
        birthPlace: 'Jawa Tengah',
        parentId: ayah.id,
        generation: 2,
        job: 'PNS',
        address: 'Surabaya',
      },
    });

    // Create spouses for children
    const menantu1 = await db.familyMember.create({
      data: {
        name: 'Dewi Rahayu',
        gender: 'P',
        birthDate: '1967-04-12',
        generation: 2,
        job: 'Ibu Rumah Tangga',
        address: 'Jakarta',
      },
    });

    const menantu2 = await db.familyMember.create({
      data: {
        name: 'Hadi Wijaya',
        gender: 'L',
        birthDate: '1966-02-18',
        generation: 2,
        job: 'Dokter',
        address: 'Semarang',
      },
    });

    const menantu3 = await db.familyMember.create({
      data: {
        name: 'Rina Wulandari',
        gender: 'P',
        birthDate: '1975-07-30',
        generation: 2,
        job: 'Bidan',
        address: 'Surabaya',
      },
    });

    // Update spouse relationships for generation 2
    await db.familyMember.update({
      where: { id: anak1.id },
      data: { spouseId: menantu1.id },
    });

    await db.familyMember.update({
      where: { id: anak2.id },
      data: { spouseId: menantu2.id },
    });

    await db.familyMember.update({
      where: { id: anak3.id },
      data: { spouseId: menantu3.id },
    });

    // Create grandchildren (Generation 3)
    await db.familyMember.create({
      data: {
        name: 'Rizky Pratama',
        gender: 'L',
        birthDate: '1990-05-15',
        birthPlace: 'Jakarta',
        parentId: anak1.id,
        generation: 3,
        job: 'Software Engineer',
        address: 'Jakarta',
        education: 'S1 Teknik Informatika',
      },
    });

    await db.familyMember.create({
      data: {
        name: 'Anisa Putri',
        gender: 'P',
        birthDate: '1993-09-20',
        birthPlace: 'Jakarta',
        parentId: anak1.id,
        generation: 3,
        job: 'Dokter',
        address: 'Jakarta',
        education: 'S1 Kedokteran',
      },
    });

    await db.familyMember.create({
      data: {
        name: 'Dimas Aditya',
        gender: 'L',
        birthDate: '1992-03-10',
        birthPlace: 'Semarang',
        parentId: anak2.id,
        generation: 3,
        job: 'Arsitek',
        address: 'Semarang',
        education: 'S1 Arsitektur',
      },
    });

    await db.familyMember.create({
      data: {
        name: 'Maya Sari',
        gender: 'P',
        birthDate: '1995-11-28',
        birthPlace: 'Semarang',
        parentId: anak2.id,
        generation: 3,
        job: 'Perawat',
        address: 'Semarang',
        education: 'D3 Keperawatan',
      },
    });

    await db.familyMember.create({
      data: {
        name: 'Fajar Nugroho',
        gender: 'L',
        birthDate: '1998-07-14',
        birthPlace: 'Surabaya',
        parentId: anak3.id,
        generation: 3,
        job: 'Mahasiswa',
        address: 'Surabaya',
        education: 'S1 Manajemen',
      },
    });

    // Create sample gallery
    await db.gallery.createMany({
      data: [
        {
          title: 'Reuni Keluarga 2024',
          description: 'Acara reuni keluarga tahunan Bani Mucksin',
          imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
          category: 'gathering',
          date: '2024-01-15',
        },
        {
          title: 'Syukuran Kelahiran',
          description: 'Acara syukuran kelahiran anak ke-3',
          imageUrl: 'https://images.unsplash.com/photo-1529543544277-c91e2e5d0e3a?w=800',
          category: 'event',
          date: '2024-02-20',
        },
        {
          title: 'Foto Bersama',
          description: 'Foto keluarga besar saat lebaran',
          imageUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
          category: 'family',
          date: '2024-04-10',
        },
        {
          title: 'Wisuda Anggota Keluarga',
          description: 'Wisuda sarjana anggota keluarga',
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
          category: 'event',
          date: '2023-09-15',
        },
        {
          title: 'Silaturahmi ke Rumah Kakek',
          description: 'Kunjungan silaturahmi bulanan',
          imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
          category: 'gathering',
          date: '2024-03-05',
        },
        {
          title: 'Peringatan HUT ke-50',
          description: 'Ulang tahun emas keluarga',
          imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
          category: 'event',
          date: '2023-12-01',
        },
      ],
    });

    // Create sample events
    await db.familyEvent.createMany({
      data: [
        {
          title: 'Reuni Keluarga Tahunan',
          description: 'Acara reuni keluarga besar Bani Mucksin',
          date: '2024-07-15',
          location: 'Gedung Serbaguna Semarang',
        },
        {
          title: 'Halal Bihalal',
          description: 'Acara halal bihalal keluarga',
          date: '2024-04-20',
          location: 'Rumah Keluarga Besar',
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data created successfully' 
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
