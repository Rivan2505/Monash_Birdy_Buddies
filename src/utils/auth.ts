// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface DecodedJWT {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

// Function to parse JWT token (same as in homePage.tsx but with proper typing)
export function parseJwt(token: string): DecodedJWT {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window.atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Function to get user_sub from sessionStorage
export function getUserSub(): string | null {
  const idToken = sessionStorage.getItem('idToken');
  if (!idToken) {
    console.error('No ID token found in sessionStorage');
    return null;
  }
  
  try {
    const decodedToken = parseJwt(idToken);
    return decodedToken.sub;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

// Function to get user email from sessionStorage
export function getUserEmail(): string | null {
  const idToken = sessionStorage.getItem('idToken');
  if (!idToken) {
    console.error('No ID token found in sessionStorage');
    return null;
  }
  
  try {
    const decodedToken = parseJwt(idToken);
    return decodedToken.email || null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
} 