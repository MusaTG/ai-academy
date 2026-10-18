import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ItemCard, ItemChip, Tabs } from '../components/common';
import { displayTitle, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import type { Item } from '../lib/types';
import { relatedOfType } from './ItemPage';

/** Meslek ve Sektör Keşif Merkezi: sektörden mesleğe veya meslekten sektöre iki giriş noktası. */
export function Careers() {
  const c = useContent();
  const { lang } = usePrefs();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<'career' | 'sector'>(params.get('sector') ? 'sector' : 'career');
  const sectorId = params.get('sector') || '';
  const careers = c.items.filter((i) => i.type === 'career');
  const plannedCareers = c.planned.filter((p) => p.type === 'career');
  const groups = new Map<string, Item[]>();
  for (const it of [...careers, ...plannedCareers]) {
    const g = it.group || 'Diğer';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(it);
  }
  const sectors = c.items.filter((i) => i.type === 'sector');
  const sector = c.byId.get(sectorId);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Career & Industry Explorer</div>
        <h1>{lang === 'en' ? 'Career Explorer' : 'Meslek ve Sektör Keşfi'}</h1>
        <p className="lede">Bir meslekten başlayıp hangi sektörlerde nasıl farklılaştığını, ya da bir sektörden başlayıp orada hangi ekiplerin ne iş yaptığını keşfedin. Sorumluluklar şirketten şirkete değişir; her sayfa ortak çekirdeği anlatır.</p>
      </div>
      <Tabs value={mode} onChange={setMode} options={[['career', 'Meslekten başla'], ['sector', 'Sektörden başla']]} />
      {mode === 'career' ? (
        <>
          <p className="small muted">{careers.length} meslek yazıldı, {plannedCareers.length} meslek planlandı (kesik çizgili kartlar henüz içerik içermez).</p>
          {[...groups.entries()].sort((a, b) => b[1].filter((x) => !x.planned).length - a[1].filter((x) => !x.planned).length).map(([g, arr]) => (
            <section key={g}>
              <h2>{g}</h2>
              <div className="grid">{arr.sort((a, b) => Number(!!a.planned) - Number(!!b.planned) || (a.order ?? 99) - (b.order ?? 99)).map((it) => (
                <ItemCard key={it.id} item={it} extra={!it.planned && <div className="row" style={{ marginTop: '.6rem' }}>{relatedOfType(c, it.id, ['sector']).slice(0, 5).map((s) => <ItemChip key={s.id} id={s.id} />)}</div>} />
              ))}</div>
            </section>
          ))}
        </>
      ) : (
        <>
          <div className="row" style={{ marginBottom: '1rem' }}>
            <label className="field" style={{ minWidth: 260 }}>Sektör seçin
              <select value={sectorId} onChange={(e) => setParams(e.target.value ? { sector: e.target.value } : {})} data-testid="sector-select">
                <option value="">—</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{displayTitle(s, lang)}</option>)}
              </select>
            </label>
          </div>
          {sector ? (
            <>
              <h2>{displayTitle(sector, lang)} sektöründeki meslekler</h2>
              <div className="grid">{relatedOfType(c, sector.id, ['career']).map((it) => <ItemCard key={it.id} item={it} />)}</div>
              <h2>Bu sektörde kullanılan teknolojiler</h2>
              <div className="row">{relatedOfType(c, sector.id, ['technology']).map((t) => <ItemChip key={t.id} id={t.id} />)}</div>
              <p className="small" style={{ marginTop: '1.5rem' }}>Sektörün tamamı: <ItemChip id={sector.id} /></p>
            </>
          ) : <div className="grid">{sectors.map((s) => <button key={s.id} className="card link-card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setParams({ sector: s.id })}><b>{displayTitle(s, lang)}</b><p className="small muted" style={{ margin: '.3rem 0 0' }}>{relatedOfType(c, s.id, ['career']).length} meslek bağlantısı</p></button>)}</div>}
        </>
      )}
    </div>
  );
}
