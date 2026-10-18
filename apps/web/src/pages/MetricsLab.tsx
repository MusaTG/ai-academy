import katex from 'katex';
import { useState } from 'react';
import { ItemChip } from '../components/common';

function Tex({ expr, block }: { expr: string; block?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(expr, { displayMode: !!block, throwOnError: false }) }} />;
}
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const f3 = (x: number) => (Number.isFinite(x) ? x.toFixed(3) : 'tanımsız');

function Confusion() {
  const [m, setM] = useState({ tp: '80', fp: '20', fn: '10', tn: '890' });
  const tp = num(m.tp), fp = num(m.fp), fn = num(m.fn), tn = num(m.tn);
  const p = tp / (tp + fp), r = tp / (tp + fn), f1 = (2 * p * r) / (p + r), acc = (tp + tn) / (tp + fp + fn + tn), spec = tn / (tn + fp);
  return (
    <div className="card">
      <h3>Karışıklık matrisi → Precision, Recall, F1</h3>
      <div className="row">{(['tp', 'fp', 'fn', 'tn'] as const).map((k) => <label key={k} className="field">{k.toUpperCase()}<input type="number" min={0} value={m[k]} onChange={(e) => setM({ ...m, [k]: e.target.value })} style={{ width: 90 }} /></label>)}</div>
      <Tex block expr={`\\text{Precision}=\\frac{TP}{TP+FP}=${f3(p)}\\qquad \\text{Recall}=\\frac{TP}{TP+FN}=${f3(r)}`} />
      <Tex block expr={`F_1=\\frac{2PR}{P+R}=${f3(f1)}\\qquad \\text{Accuracy}=${f3(acc)}\\qquad \\text{Specificity}=${f3(spec)}`} />
      <p className="small muted">Dikkat: sınıflar dengesizse (ör. fraud) accuracy yanıltıcıdır — {f3(acc)} değerine rağmen modelin pozitiflerin %{Math.round((1 - r) * 100) || 0}'ini kaçırdığını Recall gösterir. Payda 0 ise metrik tanımsızdır.</p>
      <div className="row"><ItemChip id="precision-recall" /><ItemChip id="f1-score" /><ItemChip id="class-imbalance" /></div>
    </div>
  );
}

function IoU() {
  const [a, setA] = useState('0,0,4,4');
  const [b, setB] = useState('2,2,6,6');
  const pa = a.split(',').map(num), pb = b.split(',').map(num);
  const iw = Math.max(0, Math.min(pa[2], pb[2]) - Math.max(pa[0], pb[0])), ih = Math.max(0, Math.min(pa[3], pb[3]) - Math.max(pa[1], pb[1]));
  const inter = iw * ih, areaA = (pa[2] - pa[0]) * (pa[3] - pa[1]), areaB = (pb[2] - pb[0]) * (pb[3] - pb[1]);
  const iou = inter / (areaA + areaB - inter), dice = (2 * inter) / (areaA + areaB);
  return (
    <div className="card">
      <h3>Kutu IoU ve Dice</h3>
      <div className="row"><label className="field">Kutu A (x1,y1,x2,y2)<input value={a} onChange={(e) => setA(e.target.value)} /></label><label className="field">Kutu B<input value={b} onChange={(e) => setB(e.target.value)} /></label></div>
      <Tex block expr={`\\text{IoU}=\\frac{|A\\cap B|}{|A\\cup B|}=\\frac{${inter}}{${areaA}+${areaB}-${inter}}=${f3(iou)}\\qquad \\text{Dice}=\\frac{2|A\\cap B|}{|A|+|B|}=${f3(dice)}`} />
      <p className="small muted">Varyant: sürekli koordinat (genişlik = x2−x1). Bazı kütüphaneler piksel indeksli kutularda “+1” konvansiyonu kullanır; sonuçlar küçük kutularda farklılaşır.</p>
      <div className="row"><ItemChip id="iou" /><ItemChip id="dice" /><ItemChip id="iou-dice-metrics" /></div>
    </div>
  );
}

function MSE() {
  const [y, setY] = useState('3, 5, 2.5, 7');
  const [yh, setYh] = useState('2.5, 5, 4, 8');
  const a = y.split(',').map((s) => num(s.trim())), b = yh.split(',').map((s) => num(s.trim()));
  const n = Math.min(a.length, b.length);
  const sq = a.slice(0, n).map((v, i) => (v - b[i]) ** 2);
  const mse = sq.reduce((s, v) => s + v, 0) / n;
  return (
    <div className="card">
      <h3>Mean Squared Error</h3>
      <div className="row"><label className="field">Gerçek değerler y<input value={y} onChange={(e) => setY(e.target.value)} /></label><label className="field">Tahminler ŷ<input value={yh} onChange={(e) => setYh(e.target.value)} /></label></div>
      <Tex block expr={`\\operatorname{MSE}=\\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2=\\frac{${sq.map((v) => +v.toFixed(3)).join('+')}}{${n}}=${f3(mse)}`} />
      <p className="small muted">Kareler büyük hataları orantısız cezalandırır; aykırı değerler varsa MAE veya Huber kaybını da raporlayın. RMSE = {f3(Math.sqrt(mse))} (hedefle aynı birimde).</p>
    </div>
  );
}

export function MetricsLab() {
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Metrics Lab</div>
        <h1>Metrik Laboratuvarı</h1>
        <p className="lede">Girdileri değiştirin, formülün her adımını görün. Tek bir metrik değeri modelin kalitesini kanıtlamaz: veri dağılımı, test seti ve hata maliyeti birlikte değerlendirilmelidir.</p>
      </div>
      <div className="stack"><Confusion /><IoU /><MSE /></div>
    </div>
  );
}
