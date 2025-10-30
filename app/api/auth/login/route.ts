import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Hardcoded credentials
const VALID_USERNAME = 'gabrielafs';
const VALID_PASSWORD = '220825';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Normalize username to lowercase for case-insensitive comparison
    const normalizedUsername = username?.toLowerCase();

    // Validate credentials
    if (normalizedUsername === VALID_USERNAME && password === VALID_PASSWORD) {
      // Create session token with timestamp
      const sessionData = {
        username: normalizedUsername, // Use normalized username
        loginTime: Date.now(),
      };
      const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
      
      // Set cookie with 30 minutes expiration
      const cookieStore = await cookies();
      cookieStore.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes in seconds
        path: '/',
      });

      return NextResponse.json({ 
        success: true,
        message: 'Login successful' 
      });
    } else {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
