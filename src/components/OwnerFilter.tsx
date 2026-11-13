import { avatarDataUrl } from '../utils/avatar';

interface Owner { id: string; name: string; }

interface Props {
  owners: Owner[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function OwnerFilter({ owners, value, onChange }: Props) {
  return (
    <div className="owners" role="listbox" aria-label="Фильтр по пользователям">
      <button
        className={`owner ${!value ? 'on' : ''}`}
        onClick={() => onChange(null)}
      >
        <span className="owner-av owner-av-all">Все</span>
        <span className="owner-name">Все</span>
      </button>
      {owners.map(o => (
        <button
          key={o.id}
          className={`owner ${value === o.id ? 'on' : ''}`}
          onClick={() => onChange(value === o.id ? null : o.id)}
          title={o.name}
        >
          <img className="owner-av" src={avatarDataUrl(o.name)} alt="" />
          <span className="owner-name">{o.name}</span>
        </button>
      ))}
    </div>
  );
}