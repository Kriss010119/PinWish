import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';
import { useWishes } from './hooks/useWishes';
import { db } from './firebase';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { WishGrid } from './components/WishGrid';
import { WishModal } from './components/WishModal';
import { WishForm } from './components/WishForm';
import { ProfileModal } from './components/ProfileModal';
import { GlobeIcon, LockIcon } from './components/icons';
import type { Filter, Wish } from './types';

type FormState = { mode: 'create' } | { mode: 'edit'; wish: Wish } | null;

export default function App() {
  const { user, profile, loading } = useAuth();
  const wishes = useWishes(user?.uid ?? null);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [showProfile, setShowProfile] = useState(false);

  const myWishes = useMemo(
    () => wishes.filter(w => w.ownerId === user?.uid),
    [wishes, user],
  );

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return wishes.filter(w => {
      if (!user) return false;
      if (filter === 'mine' && w.ownerId !== user.uid) return false;
      if (filter === 'booked' && w.reservedBy !== user.uid) return false;
      if (s && !`${w.title} ${w.desc ?? ''}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [wishes, filter, search, user]);

  if (loading) return <div className="loading">Загрузка…</div>;
  if (!user) return <AuthPage />;

  const opened = openedId ? wishes.find(w => w.id === openedId) : null;

  const handleBook = (id: string) => {
    updateDoc(doc(db, 'wishes', id), { reservedBy: user.uid })
      .catch((e: any) => alert('Ошибка: ' + e.message));
  };
  const handleUnbook = (id: string) => {
    updateDoc(doc(db, 'wishes', id), { reservedBy: null })
      .catch((e: any) => alert('Ошибка: ' + e.message));
  };

  return (
    <>
      <Header
        user={user}
        profile={profile}
        search={search}
        onSearch={setSearch}
        onCreate={() => setForm({ mode: 'create' })}
        onProfile={() => setShowProfile(true)}
      />

      <Tabs value={filter} onChange={setFilter} />

      <main>
        {filter === 'mine' && profile && (
          <div className="bar">
            <span className="bar-icon">
              {profile.isPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}
            </span>
            <span>
              {profile.isPublic
                ? 'Ваш вишлист публичный: его видят все пользователи'
                : 'Ваш вишлист приватный: его видите только вы'}
            </span>
            <button className="btn small" onClick={() => setShowProfile(true)}>
              Изменить
            </button>
          </div>
        )}

        {visible.length > 0 ? (
          <WishGrid
            wishes={visible}
            currentUserId={user.uid}
            onOpen={setOpenedId}
            onBook={handleBook}
            onUnbook={handleUnbook}
          />
        ) : (
          <div className="empty">
            {filter === 'booked'
              ? 'Вы пока ничего не бронировали'
              : filter === 'mine'
                ? 'У вас пока нет желаний. Нажмите «Создать»'
                : 'Пока здесь пусто. Нажмите «Создать», чтобы загадать желание'}
          </div>
        )}
      </main>

      <button
        className="fab btn red"
        onClick={() => setForm({ mode: 'create' })}
        aria-label="Создать"
      >+</button>

      {opened && (
        <WishModal
          wish={opened}
          currentUserId={user.uid}
          onClose={() => setOpenedId(null)}
          onEdit={() => {
            setOpenedId(null);
            setForm({ mode: 'edit', wish: opened });
          }}
        />
      )}

      {form && profile && (
        <WishForm
          userId={user.uid}
          profile={profile}
          wish={form.mode === 'edit' ? form.wish : undefined}
          onClose={() => setForm(null)}
        />
      )}

      {showProfile && profile && (
        <ProfileModal
          user={user}
          profile={profile}
          myWishes={myWishes}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}