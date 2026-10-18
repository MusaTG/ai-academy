import { Link } from 'react-router-dom';
import { itemHref, ItemLink } from '../components/common';
import { displayTitle, useContent } from '../lib/content';
import { usePrefs } from '../lib/prefs';
import { allProgress, stepsDone } from '../lib/progress';
import { useStore } from '../lib/store';

export function Paths() {
  const c = useContent();
  const { lang } = usePrefs();
  const prog = useStore(() => allProgress());
  const paths = c.items.filter((i) => i.type === 'path');
  const levels = ['Başlangıç', 'Temel', 'Orta', 'İleri', 'Uzman'];
  const topics = c.items.filter((i) => ['concept', 'algorithm', 'model', 'formula', 'metric', 'tutorial'].includes(i.type));
  const byLevel = new Map<string, typeof topics>();
  for (const t of topics) {
    const l = levels.find((x) => (t.level || '').startsWith(x)) || 'Seviye belirtilmemiş';
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l)!.push(t);
  }
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Roadmap</div>
        <h1>{lang === 'en' ? 'Learning paths' : 'Öğrenme yolları'}</h1>
        <p className="lede">Sıralama ön koşul ilişkilerine göre yapılır. Bir konunun ön koşulları konunun sayfasında “İlişkiler” panelinde görünür.</p>
      </div>
      <div className="grid two">
        {paths.map((p) => {
          const d = stepsDone(p, prog);
          return (
            <div className="card" key={p.id}>
              <div className="spread"><Link to={itemHref(p.id)}><b>{displayTitle(p, lang)}</b></Link><span className="small muted">{p.duration}</span></div>
              <p className="small muted">{p.summary}</p>
              <div className="meter"><i style={{ width: `${(d / (p.steps?.length || 1)) * 100}%` }} /></div>
              <ol className="small" style={{ paddingLeft: '1.2rem', marginBottom: 0 }}>
                {p.steps!.slice(0, 6).map((s) => <li key={s}><ItemLink id={s} /> {prog.get(s)?.status === 'done' && '✓'}</li>)}
                {p.steps!.length > 6 && <li className="muted">… {p.steps!.length - 6} adım daha</li>}
              </ol>
            </div>
          );
        })}
      </div>
      <h2>Seviyeye göre konular</h2>
      {[...levels, 'Seviye belirtilmemiş'].filter((l) => byLevel.has(l)).map((l) => (
        <section key={l}>
          <h3>{l}</h3>
          <div className="row">{byLevel.get(l)!.map((t) => <Link key={t.id} className="chip" to={itemHref(t.id)}>{prog.get(t.id)?.status === 'done' ? '✓ ' : ''}{t.title}</Link>)}</div>
        </section>
      ))}
    </div>
  );
}
