---
id: focal-loss
type: formula
title: Focal Loss
title_en: Focal Loss
summary: Kolay örneklerin kaybını bastırıp modelin zor ve nadir örneklere odaklanmasını sağlayan, çapraz entropinin ağırlıklandırılmış bir türevi.
status: complete
level: Orta
aliases: [Odak Kaybı]
tags: [kayıp-fonksiyonu, dengesizlik, nesne-tespiti]
relations:
  is_a: [cross-entropy]
  used_with: [class-imbalance, object-detection, binary-classification, hard-example-mining]
  evaluated_with: [precision-recall]
sources:
  - { title: "Lin et al. (2017). Focal Loss for Dense Object Detection", url: "https://arxiv.org/abs/1708.02002", kind: preprint, lang: en }
last_verified: 2026-10-18
version: 1
quiz:
  - q: "γ = 0 olduğunda Focal Loss neye eşittir?"
    options: ["MSE", "(α ağırlıklı) çapraz entropi", "Dice loss", "Hinge loss"]
    answer: 1
    explain: "(1 − p_t)^0 = 1 olduğu için modülasyon terimi kaybolur."
  - q: "Model bir örneği p_t = 0.9 ile doğru tahmin ediyorsa, γ = 2 iken kayıp çapraz entropiye göre kaç kat küçülür?"
    options: ["10 kat", "100 kat", "2 kat", "Değişmez"]
    answer: 1
    explain: "(1 − 0.9)^2 = 0.01, yani 100 kat küçülür."
---

## Basit anlatım {#intuition}

Bir sınavda 1000 kolay, 10 zor soru düşünün. Her soruya eşit zaman ayırırsanız zor sorulara hiç sıra gelmez. Focal Loss, modelin **zaten iyi bildiği kolay örneklere ayırdığı "dikkati" azaltır** ve öğrenmeyi zor örneklere kaydırır.

## Neden gerekli? {#why}

Tek aşamalı nesne tespitinde bir görüntüde binlerce aday kutunun çok büyük kısmı arka plandır (kolay negatif). Standart [[Cross-Entropy]] ile bu kolay örneklerin toplam kaybı, az sayıdaki gerçek nesnenin kaybını bastırır. Bu, [[Class Imbalance]] probleminin özel bir hâlidir.

## Matematik {#math}

İkili sınıflandırmada $p$ modelin pozitif sınıf olasılığı, $y \in \{0,1\}$ gerçek etiket olsun. Doğru sınıfın olasılığını tanımlayalım:

$$
p_t = \begin{cases} p & y = 1 \\ 1 - p & y = 0 \end{cases}
$$

Focal Loss (bu sayfada kullanılan varyant, Lin ve ark. 2017):

$$
\mathrm{FL}(p_t) = -\,\alpha_t\,(1 - p_t)^{\gamma}\,\log(p_t)
$$

- $\gamma \ge 0$: odaklanma parametresi. $\gamma = 0$ iken (α ağırlıklı) çapraz entropiye döner. Makalede $\gamma = 2$ iyi sonuç vermiştir.
- $\alpha_t$: sınıf ağırlığı (pozitifler için $\alpha$, negatifler için $1-\alpha$).

> **Varyant notu:** Bazı kütüphaneler α terimini hiç kullanmaz veya çok sınıflı sürümde farklı normalleştirir. Hangi tanımı kullandığınızı raporlayın.

## Elle hesaplama {#example}

$\alpha = 1$ (ağırlıksız) ve $\gamma = 2$ alalım; doğal logaritma kullanılıyor.

| Örnek | $p_t$ | CE $= -\log p_t$ | Modülasyon $(1-p_t)^2$ | FL |
|---|---|---|---|---|
| Kolay | 0,9 | 0,105 | 0,01 | 0,00105 |
| Zor | 0,1 | 2,303 | 0,81 | 1,865 |

Çapraz entropide zor örneğin kaybı kolayınkinin yaklaşık 22 katıyken, Focal Loss'ta yaklaşık **1776 katı**dır. Model gradyanını büyük ölçüde zor örnekten alır.

## Hata analizi {#failure-modes}

- **Etiket gürültüsü:** Yanlış etiketli örnekler "zor" görünür; Focal Loss onlara daha çok odaklanıp gürültüyü ezberleyebilir.
- **Kalibrasyon:** Olasılıklar daha az kalibre olabilir; karar eşiğini doğrulama setinde yeniden seçin.
- **γ seçimi:** Çok büyük γ, öğrenmeyi yavaşlatabilir. Önce 0 (baseline), sonra 1–2 deneyin.

## Özet {#summary}

Focal Loss = çapraz entropi × $(1-p_t)^\gamma$. Kolay örnekleri bastırır, zor/nadir örnekleri öne çıkarır. Dengesizlikte sınıf ağırlıkları ve [[Hard Example Mining]] ile birlikte düşünülür; başarısı [[Precision ve Recall]] ile ölçülür.
