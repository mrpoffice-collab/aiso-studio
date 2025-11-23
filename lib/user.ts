import { currentUser } from '@clerk/nextjs/server';
import { db } from './db';

export async function syncUser() {
  console.log('[SYNC_USER] Starting user sync...');
  const clerkUser = await currentUser();

  if (!clerkUser) {
    console.log('[SYNC_USER] No Clerk user found');
    return null;
  }

  console.log('[SYNC_USER] Clerk user found:', clerkUser.id);

  // Check if user exists
  const existingUser = await db.getUserByClerkId(clerkUser.id);

  if (existingUser) {
    console.log('[SYNC_USER] User exists in DB:', existingUser.id);
    return existingUser;
  }

  console.log('[SYNC_USER] Creating new user in DB...');
  // Create new user
  const newUser = await db.createUser({
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
  });

  console.log('[SYNC_USER] New user created:', newUser.id);
  return newUser;
}

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const user = await db.getUserByClerkId(clerkUser.id);
  return user;
}
