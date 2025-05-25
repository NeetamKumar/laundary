import { mockUsers } from './mockData';
import type { AuthUser } from '../types';

export async function signInWithEmail(identifier: string, password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = mockUsers.find(u => 
    (u.email === identifier || u.prn === identifier) && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email/PRN or password');
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    prn: user.prn
  };

  return { user: authUser };
}

export async function registerUser(form: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app, this would create a new user
  // For now, just return an error since we're using mock data
  throw new Error('Registration is disabled in demo mode');
}

export async function signOut() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}