import { useState } from 'react';
import { ItemCard, ItemChip, Tabs } from '../components/common';
import { useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';

export function Industry() {
  const c = useContent();
  const { lang } = usePrefs();
  const [tab, setTab] = useState<'sectors' | 'tech'>('sectors');
  const sectors = [...c.items.filter((i) => i.type === 'sector'), ...c.planned.filter((p) => p.type === 'sector')]
    .sort((a, b) => Number(!!a.planned) - Number(!!b.planned) || (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title, 'tr'));
  const tech = c.items.filter((i) => i.type === 'technology');
  const written = sectors.filter((s) => !s.planned).length;

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Industry Academy</div>
        <h1>{lang === 'en' ? 'Industry Academy' : 'Sektör Akademisi'}</h1>
        <p className="lede">Her sektör aynı 16 katmanlı şablonla anlatılır: temel işleyiş, terminoloji, değer zinciri, meslekler, veri, yöntemler, metrikler, mevzuat… Rozet, şablonun ne kadarının gerçekten yazıldığını gösterir.</p>
      </div>
      <Tabs value={tab} onChange={setTab} options={[['sectors', `Sektörler (${written} yazıldı · ${sectors.length - written} planlandı)`], ['tech', `Sektörler arası teknolojiler (${tech.length})`]]} />
      {tab === 'sectors' ? (
        <div className="grid">{sectors.map((s) => <ItemCard key={s.id} item={s} extra={s.group && <div className="small muted" style={{ marginTop: '.5rem' }}>{s.group}</div>} />)}</div>
      ) : (
        <>
          <p className="small muted">Aynı yöntem farklı sektörlerde farklı varsayım, metrik ve kısıtlarla kullanılır. Her sayfanın “Sektöre göre neler değişir?” bölümü bunu anlatır.</p>
          <div className="grid">
            {tech.map((t) => (
              <ItemCard key={t.id} item={t} extra={<div className="row" style={{ marginTop: '.6rem' }}>{(t.relations.used_in_sector || []).map((s) => <ItemChip key={s} id={s} />)}</div>} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
