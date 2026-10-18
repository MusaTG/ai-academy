---
id: graph-learning
type: technology
title: Graph Learning
title_en: Graph Learning
summary: Varlıklar arası ilişkileri (kim kime para gönderdi, hangi protein hangisiyle etkileşir) doğrudan modelleyen yöntemler.
status: complete
group: Ortak teknolojiler
level: İleri
aliases: [Graf Öğrenmesi, Graph Neural Networks, GNN, Graf Analitiği]
tags: [graf, gnn, ilişki]
relations:
  used_in_sector: [banking, ecommerce, healthcare, cybersecurity, telecom]
  used_with: [anomaly-detection]
sources:
  - { title: "Kipf & Welling (2016). Semi-Supervised Classification with Graph Convolutional Networks", url: "https://arxiv.org/abs/1609.02907", kind: preprint, lang: en }
  - { title: "Hamilton, Ying, Leskovec (2017). Inductive Representation Learning on Large Graphs (GraphSAGE)", url: "https://arxiv.org/abs/1706.02216", kind: preprint, lang: en }
last_verified: 2026-10-18
version: 1
---

## Basit anlatım {#intuition}

Tek bir banka hesabına bakınca her şey normal görünebilir. Ama aynı cihazı kullanan 40 hesabın aynı hesaba para gönderdiğini görünce tablo değişir. Graf öğrenmesi, verideki **ilişkileri** birinci sınıf bilgi olarak kullanır.

## Nasıl çalışır? {#how}

1. **Klasik graf analitiği:** bağlantılı bileşenler, derece, PageRank, topluluk tespiti. Hızlı ve açıklanabilir; çoğu zaman yeterli başlangıçtır.
2. **Graf gömmeleri:** düğümleri vektörlere çevirip klasik modellere özellik olarak vermek.
3. **Graph Neural Networks (GNN):** her düğüm, komşularından gelen "mesajları" toplayarak kendi temsilini günceller (message passing). GCN ve GraphSAGE yaygın örneklerdir.

## Sektöre göre neler değişir? {#sector-variation}

| Sektör | Düğümler / kenarlar | Görev |
|---|---|---|
| [[banking\|Bankacılık]] | Hesap, cihaz, IP / transfer, ortak kullanım | Dolandırıcılık halkası, para aklama ağı |
| [[ecommerce\|E-ticaret]] | Kullanıcı, ürün / tıklama, satın alma | Öneri sistemleri |
| [[healthcare\|Sağlık / biyoinformatik]] | Protein, gen, ilaç / etkileşim | İlaç-hedef tahmini |
| [[cybersecurity\|Siber güvenlik]] | Kullanıcı, makine / oturum açma | Yanal hareket (lateral movement) tespiti |
| [[telecom\|Telekom]] | Abone / arama, mesaj | Dolandırıcılık, müşteri kaybı |

## Değerlendirme {#metrics}

Düğüm sınıflandırmada sınıf dengesizliği nedeniyle PR-AUC; bağlantı tahmininde Hits@k ve MRR. **Zaman sızıntısına** dikkat: gelecekteki kenarları eğitimde kullanmayın.

## Hata analizi ve tuzaklar {#failure-modes}

- Çok yüksek dereceli "süper düğümler" (ör. büyük bir üye işyeri) mesajları domine eder.
- Rastgele kenar bölmesi zaman sızıntısı yaratır.
- Ölçeklenme: milyarlarca kenarda komşu örnekleme (sampling) gerekir.

## Bağlantılar {#related}

[[Anomaly Detection]], [[Fraud Detection]], [[banking|Bankacılık]].
