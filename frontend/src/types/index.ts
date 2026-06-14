export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  avgRating: number | null;
  owner?: { id: number; name: string; email: string };
}

export interface StoreWithUserRating extends Store {
  userRating: number | null;
  userRatingId: number | null;
}

export interface Rating {
  ratingId: number;
  rating: number;
  ratedAt: string;
  user: { id: number; name: string; email: string };
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerDashboard {
  store: { id: number; name: string; email: string; address: string };
  avgRating: number | null;
  totalRatings: number;
  raters: Rating[];
}
