import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Wish } from '../types';
import { Modal } from './Modal';
import { ExternalLinkIcon, GiftIcon } from './icons';

const GRAD = ['#ffd6e0', '#d6e8ff', '#e2f7d4', '#fff0c2', '#e6dcff', '#ffe0cc'];
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

interface Props {
  wish: Wish;
  currentUserId: string;
  onClose: () => void;
  onEdit: () => void;   // <-- новое
}

export function WishModal({ wish, currentUserId, onClose, onEdit }: Props) {
  const isMine = wish.ownerId === currentUserId;
  const isBookedByMe = wish.reservedBy === currentUserId;
  const g = GRAD[hash(wish.title || 'x') % GRAD.length];

  const book = async () => {
    try {
      await updateDoc(doc(db, 'wishes', wish.id), { reservedBy: currentUserId });
      onClose();
    } catch (e: any) { alert('Ошибка: ' + e.message); }
  };
  const unbook = async () => {
    try {
      await updateDoc(doc(db, 'wishes', wish.id), { reservedBy: null });
      onClose();
    } catch (e: any) { alert('Ошибка: ' + e.message); }
  };
  const remove = async () => {
    if (!confirm('Удалить желание?')) return;
    try {
      await deleteDoc(doc(db, 'wishes', wish.id));
      onClose();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="pic">
        {wish.image
          ? <img src={wish.image} alt="" />
          : <div className="ph" style={{ background: g, minHeight: 320 }}>
              <GiftIcon size={80} />
            </div>}
      </div>
      <div className="info">
        <div className="who">
          <div className="av">{(wish.ownerName || '?').charAt(0)}</div>
          <span>{wish.ownerName || 'Кто-то'}{isMine && ' (вы)'} загадывает</span>
        </div>
        <h2>{wish.title}</h2>
        {wish.price && <div className="price">{wish.price}</div>}
        {wish.desc && <div className="desc">{wish.desc}</div>}
        {/^https?:\/\//i.test(wish.link || '') && (
          <a href={wish.link} target="_blank" rel="noopener noreferrer" className="link-ext">
            Где купить <ExternalLinkIcon size={14} />
          </a>
        )}

        {isMine && wish.reservedBy && (
          <div className="note">Кто-то уже забронировал этот подарок.</div>
        )}
        {isMine && !wish.reservedBy && !wish.isPublic && (
          <div className="note">Ваш вишлист приватный: это желание видите только вы.</div>
        )}
        {!isMine && isBookedByMe && (
          <div className="note">Вы забронировали это желание. Другие гости его больше не видят.</div>
        )}
        {!isMine && !isBookedByMe && (
          <div className="note">После брони желание скроется у остальных гостей.</div>
        )}

        <div className="row">
          {isMine ? (
            <>
              <button className="btn" onClick={onEdit}>Редактировать</button>
              <button className="btn" onClick={remove}>Удалить</button>
            </>
          ) : isBookedByMe ? (
            <button className="btn" onClick={unbook}>Снять бронь</button>
          ) : (
            <button className="btn red" onClick={book}>Забронировать</button>
          )}
        </div>
      </div>
    </Modal>
  );
}