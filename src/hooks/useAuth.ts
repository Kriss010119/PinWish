import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  }), []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        const name = user.displayName || (user.email || 'Гость').split('@')[0];
        setDoc(ref, { name, photo: user.photoURL || '', isPublic: true });
        return;
      }
      setProfile(snap.data() as UserProfile);
    });
  }, [user]);

  return { user, profile, loading };
}