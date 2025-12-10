/**
 * Admin Configuration
 * Centralized list of admin emails for internal-only features
 */

export const ADMIN_EMAILS = [
  'mrpoffice@gmail.com',
  'kim@aliidesign.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
