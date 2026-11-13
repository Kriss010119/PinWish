import type { Filter } from '../types';

const LABELS: Record<Filter, string> = {
  all: 'Все желания',
  mine: 'Мои',
  booked: 'Я забронил(а)',
};

interface Props { value: Filter; onChange: (f: Filter) => void; }

export function Tabs({ value, onChange }: Props) {
  return (
    <div className="tabs">
      {(Object.keys(LABELS) as Filter[]).map(f => (
        <button
          key={f}
          className={`pill ${value === f ? 'on' : ''}`}
          onClick={() => onChange(f)}
        >
          {LABELS[f]}
        </button>
      ))}
    </div>
  );
}