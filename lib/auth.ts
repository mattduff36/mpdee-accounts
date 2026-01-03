// Authentication utilities and session management
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { AuthSession, LoginCredentials } from './types';
import { SignJWT, jwtVerify } from 'jose';

// JWT secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development'
);

// Session configuration
const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days (1 year) in milliseconds
const COOKIE_NAME = 'auth-session';

export async function validateCredentials(credentials: LoginCredentials): Promise<boolean> {
  try {
    const { username, password } = credentials;
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    

    
    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return false;
    }
    
    // Validate username
    if (username !== adminUsername) {
      return false;
    }
    
    // Simplified authentication - works in both dev and production
    // First try plain text comparison (most common case)
    if (password === adminPassword) {
      return true;
    }
    
    // If plain text fails, try bcrypt comparison (in case password is hashed)
    try {
      const bcryptResult = await bcrypt.compare(password, adminPassword);
      return bcryptResult;
    } catch (error) {
      return false;
    }
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}

export async function createSession(username: string): Promise<void> {
  try {
    // Create JWT token
    const payload = {
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + SESSION_DURATION) / 1000),
    };
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(JWT_SECRET);
    
    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSession(): Promise<AuthSession> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { isAuthenticated: false };
    }
    
    return {
      isAuthenticated: true,
      user: {
        username: payload.username as string,
      },
    };
  } catch (error) {
    // Token is invalid or expired
    return { isAuthenticated: false };
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error('Error destroying session:', error);
    throw new Error('Failed to destroy session');
  }
}

// Utility function to check if user is authenticated (for middleware)
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated;
}

// Utility function to require authentication (throws if not authenticated)
export async function requireAuth(): Promise<{ username: string }> {
  const session = await getSession();
  
  if (!session.isAuthenticated || !session.user) {
    throw new Error('Authentication required');
  }
  
  return session.user;
} 