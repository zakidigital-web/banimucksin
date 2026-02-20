import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// Simple hash function (for demo purposes - in production use bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password diperlukan' }, { status: 400 });
    }

    // Find admin user
    let admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    // Create default admin if not exists (first time setup)
    if (!admin) {
      const defaultPassword = 'admin123'; // Default password
      admin = await prisma.adminUser.create({
        data: {
          username: 'admin',
          password: simpleHash(defaultPassword),
          name: 'Administrator',
        },
      });

      // Check if provided credentials match default
      if (username === 'admin' && password === defaultPassword) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', admin.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return NextResponse.json({
          success: true,
          data: { username: admin.username, name: admin.name },
          message: 'Login berhasil! Password default: admin123'
        });
      }
    }

    // Verify password
    if (admin.password !== simpleHash(password)) {
      return NextResponse.json({ success: false, error: 'Password salah' }, { status: 401 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      success: true,
      data: { username: admin.username, name: admin.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

// GET - Check session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: sessionId },
      select: { id: true, username: true, name: true },
    });

    if (!admin) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    return NextResponse.json({ success: true, authenticated: true, data: admin });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ success: false, authenticated: false });
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Gagal logout' }, { status: 500 });
  }
}
