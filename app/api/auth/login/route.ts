import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Hardcoded credentials
const VALID_USERNAME = 'Gabrielafs';
const VALID_PASSWORD = '220825';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Create session token (simple base64 encoded string)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      // Set cookie as session cookie (expires when browser closes)
      const cookieStore = await cookies();
      cookieStore.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        // No maxAge means it's a session cookie - expires when browser closes
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
