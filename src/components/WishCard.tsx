import type { Wish } from '../types';
import { CheckIcon, ExternalLinkIcon, GiftIcon, LockIcon } from './icons';

const GRAD = ['#ffd6e0', '#d6e8ff', '#e2f7d4', '#fff0c2', '#e6dcff', '#ffe0cc'];
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

interface Props {
  wish: Wish;
  currentUserId: string;
  onOpen: () => void;
  onBook: (id: string) => void;
  onUnbook: (id: string) => void;
}

export function WishCard({ wish, currentUserId, onOpen, onBook, onUnbook }: Props) {
  const isMine = wish.ownerId === currentUserId;
  const isBookedByMe = wish.reservedBy === currentUserId;
  const g = GRAD[hash(wish.title || 'x') % GRAD.length];
  const hasLink = /^https?:\/\//i.test(wish.link || '');

  return (
    <div className="card" onClick={onOpen}>
      <div className="thumb">
        {wish.image
          ? <img src={wish.image} alt="" />
          : (
            <div className="ph" style={{ background: g }}>
              <GiftIcon size={56} />
            </div>
          )}

        {wish.reservedBy && (
          <div className="badge">
            {isMine ? 'Забронировано' : <><CheckIcon size={12} /> Вы забронировали</>}
          </div>
        )}
        {!wish.reservedBy && isMine && !wish.isPublic && (
          <div className="badge"><LockIcon size={12} /> Приватное</div>
        )}

        <div className="hover-layer">
          <div className="hover-actions">
            {hasLink && (
              <a
                className="hover-icon"
                href={wish.link}
                target="_blank"
                rel="noopener noreferrer"
                title="Открыть ссылку"
                aria-label="Открыть ссылку"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon size={18} />
              </a>
            )}
            {!isMine && !isBookedByMe && (
              <button
                className="hover-btn primary"
                onClick={(e) => { e.stopPropagation(); onBook(wish.id); }}
              >
                Забронировать
              </button>
            )}
            {isBookedByMe && (
              <button
                className="hover-btn"
                onClick={(e) => { e.stopPropagation(); onUnbook(wish.id); }}
              >
                Снять бронь
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="t">{wish.title}</div>
      <div className="s">
        {wish.price ? `${wish.price} · ` : ''}
        {wish.ownerName || 'Кто-то'}
      </div>
    </div>
  );
}