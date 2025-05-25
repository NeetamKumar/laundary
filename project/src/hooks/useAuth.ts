import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import type { AuthUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const user = await db.signIn(identifier, password);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await db.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  return {
    user,
    loading,
    login,
    logout
  };
}