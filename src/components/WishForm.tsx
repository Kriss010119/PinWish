import { type ChangeEvent, type FormEvent, useState } from 'react';
import { addDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, wishesCol } from '../firebase';
import type { UserProfile, Wish } from '../types';
import { Modal } from './Modal';
import { CameraIcon } from './icons';
import { resizeImage } from '../utils/image';

interface Props {
  userId: string;
  profile: UserProfile;
  wish?: Wish;          // если передан — редактируем
  onClose: () => void;
}

export function WishForm({ userId, profile, wish, onClose }: Props) {
  const isEdit = !!wish;
  const [title, setTitle] = useState(wish?.title ?? '');
  const [desc, setDesc] = useState(wish?.desc ?? '');
  const [price, setPrice] = useState(wish?.price ?? '');
  const [link, setLink] = useState(wish?.link ?? '');
  const [image, setImage] = useState(wish?.image ?? '');
  const [busy, setBusy] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setImage(await resizeImage(f)); } catch { /* ignore */ }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      if (isEdit) {
        // reservedBy, ownerId, createdAt не трогаем — правила это запрещают.
        await updateDoc(doc(db, 'wishes', wish!.id), {
          title: title.trim(),
          desc: desc.trim(),
          price: price.trim(),
          link: link.trim(),
          image,
          // isPublic намеренно не меняем: он управляется в профиле батчем.
        });
      } else {
        await addDoc(wishesCol, {
          title: title.trim(),
          desc: desc.trim(),
          price: price.trim(),
          link: link.trim(),
          image,
          ownerId: userId,
          ownerName: profile.name,
          isPublic: !!profile.isPublic,
          reservedBy: null,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (e: any) {
      setBusy(false);
      alert('Не удалось сохранить: ' + e.message);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form className="f" onSubmit={onSubmit}>
        <h2>{isEdit ? 'Редактировать желание' : 'Новое желание'}</h2>

        <label className="drop">
          {image
            ? <img src={image} alt="" />
            : <><CameraIcon size={28} /><span>Добавить фото</span></>}
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>

        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Что хочется?" required maxLength={120} />
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Подробности: размер, цвет, почему хочется…" maxLength={1500} />
        <input value={price} onChange={e => setPrice(e.target.value)}
          placeholder="Примерная цена (необязательно)" maxLength={40} />
        <input value={link} onChange={e => setLink(e.target.value)}
          type="url" placeholder="Ссылка на товар (необязательно)" />

        <div className="row">
          {isEdit && image && (
            <button type="button" className="btn" onClick={() => setImage('')}>
              Убрать фото
            </button>
          )}
          <button className="btn red" type="submit" disabled={busy}>
            {isEdit ? 'Сохранить' : 'Загадать'}
          </button>
        </div>
      </form>
    </Modal>
  );
}