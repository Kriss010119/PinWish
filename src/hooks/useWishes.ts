import { useEffect, useMemo, useState } from 'react';
import { onSnapshot, query, where } from 'firebase/firestore';
import { wishesCol } from '../firebase';
import type { Wish } from '../types';

interface Parts { free: Wish[]; mine: Wish[]; booked: Wish[]; }
const EMPTY: Parts = { free: [], mine: [], booked: [] };

export function useWishes(userId: string | null): Wish[] {
  const [parts, setParts] = useState<Parts>(EMPTY);

  useEffect(() => {
    if (!userId) { setParts(EMPTY); return; }

    const push = (key: keyof Parts) => (snap: any) => {
      setParts(p => ({ ...p, [key]: snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) }));
    };

    const subs = [
      onSnapshot(
        query(wishesCol, where('isPublic', '==', true), where('reservedBy', '==', null)),
        push('free'),
        (e) => console.error('free', e),
      ),
      onSnapshot(
        query(wishesCol, where('ownerId', '==', userId)),
        push('mine'),
        (e) => console.error('mine', e),
      ),
      onSnapshot(
        query(wishesCol, where('isPublic', '==', true), where('reservedBy', '==', userId)),
        push('booked'),
        (e) => console.error('booked', e),
      ),
    ];

    return () => subs.forEach(u => u());
  }, [userId]);

  return useMemo(() => {
    const map = new Map<string, Wish>();
    [...parts.free, ...parts.mine, ...parts.booked].forEach(w => map.set(w.id, w));
    return [...map.values()].sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    );
  }, [parts]);
}