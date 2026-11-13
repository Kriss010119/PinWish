import type { Wish } from '../types';
import { WishCard } from './WishCard';

interface Props {
  wishes: Wish[];
  currentUserId: string;
  onOpen: (id: string) => void;
  onBook: (id: string) => void;
  onUnbook: (id: string) => void;
}

export function WishGrid({ wishes, currentUserId, onOpen, onBook, onUnbook }: Props) {
  return (
    <div className="grid">
      {wishes.map(w => (
        <WishCard
          key={w.id}
          wish={w}
          currentUserId={currentUserId}
          onOpen={() => onOpen(w.id)}
          onBook={onBook}
          onUnbook={onUnbook}
        />
      ))}
    </div>
  );
}