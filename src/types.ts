export interface Wish {
  id: string;
  title: string;
  desc?: string;
  price?: string;
  link?: string;
  image?: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  reservedBy: string | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

export interface UserProfile {
  name: string;
  photo?: string;
  isPublic: boolean;
}

export type Filter = 'all' | 'mine' | 'booked';