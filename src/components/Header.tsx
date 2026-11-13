import type { User } from 'firebase/auth';
import type { UserProfile } from '../types';
import { avatarDataUrl } from '../utils/avatar';

interface Props {
  user: User;
  profile: UserProfile | null;
  search: string;
  onSearch: (v: string) => void;
  onCreate: () => void;
  onProfile: () => void;
}

export function Header({ user, profile, search, onSearch, onCreate, onProfile }: Props) {
  const name = profile?.name || user.displayName || user.email || '?';
  const src = profile?.photo || user.photoURL || avatarDataUrl(name);
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <header>
      <div className="logo">
        <img className="logo-img" src={logoUrl} alt="logo" />
      </div>
      <input
        className="search"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Поиск желаний"
      />
      <button className="btn red" onClick={onCreate}>Создать</button>
      <button className="me-btn" onClick={onProfile} title="Профиль" aria-label="Профиль">
        <img className="me" src={src} alt="" />
      </button>
    </header>
  );
}