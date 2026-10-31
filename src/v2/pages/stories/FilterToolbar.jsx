import React, { useEffect, useId, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, Swords, ChevronDown } from 'lucide-react';
import { TIER_META } from '../../lib/tierMeta';
import { SORTS } from './useStoryFilters';

// Fade an edge only when there is more to scroll in that direction.
function useScrollEdges(ref) {
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 2, end: max - el.scrollLeft > 2 });
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [ref]);
  return edges;
}

function ChipRow({ label, children, grow = false }) {
  const id = useId();
  const ref = useRef(null);
  const { start, end } = useScrollEdges(ref);
  return (
    <div className={`pf-stories-chips ${grow ? 'pf-stories-chips--grow' : ''}`} role="group" aria-labelledby={id}>
      <span className="pf-stories-chips__label" id={id}>{label}</span>
      <div ref={ref} className="pf-stories-chips__scroll" data-fade-start={start} data-fade-end={end}>{children}</div>
    </div>
  );
}

function Select({ label, value, onChange, disabled, children }) {
  const id = useId();
  return (
    <div className="pf-stories-select">
      <label className="v2-visually-hidden" htmlFor={id}>{label}</label>
      <select id={id} className="v2-input pf-stories-select__el" value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDown className="pf-stories-select__icon" size={16} aria-hidden="true" />
    </div>
  );
}

export default function FilterToolbar({ options, filters, update, toggleIn, reset, activeCount, resultCount, total }) {
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();
  // Filters other than search live in the collapsible panel on phones.
  const panelCount = activeCount - (filters.query.trim() ? 1 : 0);

  return (
    <div className="pf-stories-toolbar" data-open={open}>
      <div className="v2-container pf-stories-toolbar__inner">
        <div className="pf-stories-toolbar__top">
          <div className="pf-stories-search">
            <label className="v2-visually-hidden" htmlFor={searchId}>
              Search stories by title, genre, medium or favourite character
            </label>
            <Search className="pf-stories-search__icon" size={17} aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              className="v2-input pf-stories-search__input"
              placeholder="Title, genre, character…"
              value={filters.query}
              onChange={e => update({ query: e.target.value })}
              autoComplete="off"
            />
            {filters.query && (
              <button type="button" className="pf-stories-search__clear" onClick={() => update({ query: '' })}
                aria-label="Clear search">
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <button type="button" className="v2-button pf-stories-toolbar__toggle" aria-expanded={open}
            aria-controls={panelId} onClick={() => setOpen(o => !o)}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {panelCount > 0 && <span className="pf-stories-toolbar__badge v2-num">{panelCount}</span>}
          </button>

          <div className="pf-stories-toolbar__controls">
            <Select label="Genre" value={filters.genre} onChange={genre => update({ genre })}>
              <option value="">All genres</option>
              {options.genres.map(g => (
                <option key={g.value} value={g.value}>{g.value} ({g.n})</option>
              ))}
            </Select>
            <Select label="Sort by" value={filters.disagree ? 'gap' : filters.sort}
              disabled={filters.disagree} onChange={sort => update({ sort })}>
              {filters.disagree && <option value="gap">Biggest gap</option>}
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
            <button type="button" className="v2-chip pf-stories-disagree" aria-pressed={filters.disagree}
              onClick={() => update({ disagree: !filters.disagree })}>
              <Swords size={15} aria-hidden="true" />
              Where we disagree
            </button>
          </div>
        </div>

        <div className="pf-stories-toolbar__panel" id={panelId}>
          <ChipRow label="Tier">
            {options.tiers.map(t => (
              <button key={t} type="button" className={`v2-chip pf-stories-tier-chip pf-stories-tier-chip--${t.toLowerCase()}`}
                aria-pressed={filters.tiers.includes(t)} onClick={() => toggleIn('tiers', t)}>
                {t === 'Pending' ? 'Unrated' : t}
              </button>
            ))}
          </ChipRow>
          <ChipRow label="Medium" grow>
            {options.media.map(m => (
              <button key={m.value} type="button" className="v2-chip" aria-pressed={filters.media.includes(m.value)}
                onClick={() => toggleIn('media', m.value)}>
                {m.value}
                <span className="pf-stories-chip__n v2-num">{m.n}</span>
              </button>
            ))}
          </ChipRow>
        </div>

        <div className="pf-stories-toolbar__status">
          <p className="pf-stories-toolbar__count v2-num" aria-live="polite">
            {resultCount === total
              ? <>All <strong>{total}</strong> stories</>
              : <><strong>{resultCount}</strong> of {total} stories</>}
            {filters.tiers.length > 0 && (
              <span className="pf-stories-toolbar__hint">
                {' '}· best rating {filters.tiers.map(t => TIER_META[t]?.name ?? t).join(', ')}
              </span>
            )}
          </p>
          {activeCount > 0 && (
            <button type="button" className="pf-stories-toolbar__clear" onClick={reset}>
              <X size={14} aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
