import { UserDetails } from 'src/interface';

/**
 * Get the profile picture URL for a user, properly formatted
 * 
 * @param user User details object
 * @returns Profile picture URL if available, undefined otherwise
 */
export const getProfilePictureUrl = (user?: UserDetails): string | undefined => {
  if (!user || !user.profile_picture) {
    return undefined;
  }
  
  // If the profile picture URL is already a complete URL, return it
  if (user.profile_picture.startsWith('http')) {
    return user.profile_picture;
  }
  
  // Otherwise, assume it's a relative path and construct the full URL
  // Replace this with your actual image server base URL
  const imageServerBase = 'https://fowergram.example.com/images';
  return `${imageServerBase}/${user.profile_picture}`;
};

/**
 * Get user initials for avatar display
 * 
 * @param user User details object
 * @returns Initials string (1-2 characters)
 */
export const getUserInitials = (user?: UserDetails): string => {
  if (!user || typeof user !== 'object') return '?';
  
  // ถ้ามีแค่ username ใช้ตัวอักษรแรก
  if (user.username && typeof user.username === 'string') {
    return user.username.charAt(0).toUpperCase();
  }
  
  // ถ้ามีแค่อีเมล ใช้ตัวอักษรแรกของอีเมล
  if (user.email && typeof user.email === 'string') {
    return user.email.charAt(0).toUpperCase();
  }
  
  // ถ้าไม่มีข้อมูลที่ใช้ได้
  return '?';
}; 