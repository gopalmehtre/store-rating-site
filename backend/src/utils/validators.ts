export const validateName = (name: string): string | null => {
  if (!name || name.trim().length < 20) return 'Name must be at least 20 characters.';
  if (name.trim().length > 60) return 'Name must be at most 60 characters.';
  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address || address.trim().length === 0) return 'Address is required.';
  if (address.trim().length > 400) return 'Address must be at most 400 characters.';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) return 'Password must be 8–16 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return 'Password must contain at least one special character.';
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return 'Invalid email address.';
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (!rating || rating < 1 || rating > 5) return 'Rating must be between 1 and 5.';
  return null;
};
