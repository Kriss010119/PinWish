import { type ChangeEvent, useState } from 'react';
import { deleteUser, signOut, type User } from 'firebase/auth';
import { deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile, Wish } from '../types';
import { Modal } from './Modal';
import { CameraIcon, TrashIcon } from './icons';
import { resizeImage } from '../utils/image';
import { avatarDataUrl } from '../utils/avatar';

interface Props {
  user: User;
  profile: UserProfile;
  myWishes: Wish[];
  onClose: () => void;
}

export function ProfileModal({ user, profile, myWishes, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const userId = user.uid;
  const avatarSrc = profile.photo || avatarDataUrl(profile.name);

  const onAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImage(f, 256, 0.85);
      await setDoc(doc(db, 'users', userId), { photo: dataUrl }, { merge: true });
    } catch {
      alert('Не удалось загрузить аватар');
    } finally {
      setBusy(false);
    }
  };

  const togglePublic = async (val: boolean) => {
    setBusy(true);
    try {
      await setDoc(doc(db, 'users', userId), { isPublic: val }, { merge: true });
      for (let i = 0; i < myWishes.length; i += 400) {
        const batch = writeBatch(db);
        myWishes.slice(i, i + 400).forEach(w =>
          batch.update(doc(db, 'wishes', w.id), { isPublic: val }),
        );
        await batch.commit();
      }
    } catch (e: any) {
      alert('Не удалось изменить: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Удалить аккаунт и все ваши желания? Это действие необратимо.')) return;
    setBusy(true);
    try {
      for (let i = 0; i < myWishes.length; i += 400) {
        const batch = writeBatch(db);
        myWishes.slice(i, i + 400).forEach(w => batch.delete(doc(db, 'wishes', w.id)));
        await batch.commit();
      }
      await deleteDoc(doc(db, 'users', userId));
      await deleteUser(user);
      onClose();
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        alert(
          'Данные удалены, но для полного удаления аккаунта нужен недавний вход. ' +
          'Выйдите, войдите снова и повторите удаление.',
        );
      } else {
        alert('Не удалось удалить аккаунт: ' + e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="profile">
        <div className="profile-head">
          <label className="avatar-edit" title="Сменить аватар">
            <img src={avatarSrc} alt="" />
            <span className="avatar-edit-overlay"><CameraIcon size={20} /></span>
            <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={busy} />
          </label>
          <div className="profile-id">
            <h2>{profile.name}</h2>
            <div className="muted">{user.email}</div>
          </div>
        </div>

        <div className="prow">
          <div>
            <b>Публичный вишлист</b>
            <div className="muted small">
              {profile.isPublic
                ? 'Его видят все пользователи сайта и могут бронировать подарки'
                : 'Его видите только вы. Друзья ничего не увидят'}
            </div>
          </div>
          <label className="sw">
            <input
              type="checkbox"
              checked={!!profile.isPublic}
              disabled={busy}
              onChange={e => togglePublic(e.target.checked)}
            />
            <i />
          </label>
        </div>

        <div className="profile-actions">
          <button
            className="btn"
            disabled={busy}
            onClick={() => { onClose(); signOut(auth); }}
          >
            Выйти из аккаунта
          </button>
          <button
            className="btn danger"
            disabled={busy}
            onClick={deleteAccount}
          >
            <TrashIcon size={16} /> Удалить аккаунт
          </button>
        </div>
      </div>
    </Modal>
  );
}