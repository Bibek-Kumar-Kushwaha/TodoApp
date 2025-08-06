import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'
export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string;
        email: string;
    }
}

export function verifyToken(token: string): {userId: string; email: string} | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as {
            userId: string;
            email: string;
        };
        return decoded;
    } catch (error) {
        return null;
    }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header first (for localStorage fallback)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies (standard approach)
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

export function authenticateUser(request: NextRequest): { userId: string; email: string } | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}