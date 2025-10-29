import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Renew the cookie with a fresh 30 minutes
    cookieStore.set('auth-token', authToken.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes in seconds
      path: '/',
    });

    return NextResponse.json({ 
      success: true,
      message: 'Session renewed' 
    });
  } catch (error) {
    console.error('Renew error:', error);
    return NextResponse.json(
      { error: 'Error renewing session' },
      { status: 500 }
    );
  }
}
