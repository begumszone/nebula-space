# 🚀 NEBULA SPACE

**NEBULA SPACE**, 1998 yapımı kült klasik *Swarm* oyunundan esinlenen; saf HTML5 Canvas ve Web Audio API ile geliştirilmiş, 40 seviyelik taktiksel ve modern bir retro-arcade uzay harekâtıdır.

Harici hiçbir kütüphane veya oyun motoru bağımlılığı yoktur (Zero-dependency Vanilla JS). Masaüstü ve mobil cihazlarda akıcı 60 FPS performans sunar.

---

## 💎 Temel Oyun Mekanikleri & Yenilikler

### 1. 💎 Kuantum Çekirdekleri & Çifte Seviye Hedefi (Dual Objectives)
Seviye atlamak için yalnızca düşman vurmak yeterli değildir:
* **Kuantum Çekirdekleri (Quantum Cores):** Her seviyede sektörün derinliklerine (520m – 1320m) seviyeye göre **3 ila 7 adet** parıldayan kuantum kristali yerleştirilir.
* **Çifte Görev Kuralı:** Bir seviyeyi tamamlamak ve Taşıyıcı Ana Gemi'yi çağırmak için **İKİ ŞART DA** sağlanmalıdır:
  1. 💎 Sektördeki tüm Kuantum Çekirdekleri toplanmalı (`💎 ÇEKİRDEK: X / X ✓`)
  2. 👾 Sektördeki düşman tehdit kotası imha edilmeli (`👾 TEHDİT: Y / Y ✓`)
* **Dinamik Pusula & Navigasyon İbresi:** Sektörde toplanmamış çekirdek varken ekran kenarındaki altın ibre **en yakın Kuantum Çekirdeğine** kilitlenir ve mesafeyi gösterir. Görevler bitince ibre doğrudan **Taşıyıcı Ana Gemi Portalı'na** kilitlenir.
* **Seviye Radarı (Minimap):** Kuantum çekirdekleri radarda parlayan altın elmas simgeleriyle görünür.

### 2. 🛸 Taşıyıcı Savaş Gemisi & Hiperuzay Portalı (Mothership Docking)
* Görevler tamamlandığında Taşıyıcı Savaş Gemisi (Mothership) 1250 metre mesafede sektöre giriş yapar.
* Oyuncu gemisini devasa ana geminin ortasındaki hiperuzay solucan deliğine sürerek kenetlenir (Docking).
* Kenetlenme anında hipersonik warp efektleri (ışık çizgileri ve ekran parlaması) tetiklenir ve sonraki seviyeye atlanır.

### 3. ❤️ 3 Can / Hak & Seviyeden Devam Etme Sistemi
* Oyuna **3 Can (Hak)** ile başlanır. Seviyelerde bulunan yeşil **Hak / Can Kitleri** toplanarak can sayısı artırılabilir (en fazla 5).
* Gemi imha olduğunda **1. seviyeye geri dönmez!** Bulunulan seviyeden (örneğin 8. Seviyede patladıysa 8. Seviyeden) devam eder.
* Yeniden doğuşta güçlü bir **EMP şok dalgası** yayılır, çevredeki düşmanlar geri savrulur ve oyuncuya **3.5 saniyelik dokunulmazlık kalkanı** verilir.
* Yalnızca tüm canlar tükendiğinde oyun sona erer.

### 4. 🌟 20 Saniyelik Swarm Tarzı Bonus İkmal Seviyeleri
* Her 4 seviyede bir (Seviye 4, 8, 12, 16, 20, 24, 28, 32, 36) özel **Bonus İkmal Seviyesi** açılır.
* Düşman tehdidi yoktur; 20 saniye içinde haritaya saçılmış onlarca silah cephanesi ve can kiti toplanır.
* Süre bittiğinde toplanan tüm ganimetler korunarak bir sonraki seviyeye aktarılır.

### 5. ⚡ Katı Silah Hiyerarşisi (Best Weapon Retention)
* Toplanan cephaneler mevcut silahı bozmaz.
* **Kural:** Oyuncu her zaman envanterindeki **en güçlü silahı** elinde tutar. En güçlü silahın mermisi tamamen bitene kadar korunur; mermisi bittiğinde otomatik olarak bir alt kademe silaha geçer.
* Sabit ikmal kutuları uzayda kararlı durur (oyuncuyu kovalamaz veya yer değiştirmez).

### 6. 📱 Tam Mobil ve Tablet Uyumluluğu
* Sol ekranda dinamik **Sanal Joystick** ile yönlendirme ve itiş.
* Sağ ekranda dokunmatik **ATEŞ**, **İTİCİ (THRUST)**, **MAYIN** ve **SİLAH DEĞİŞTİR** eylem butonları.
* Başlangıç ekranında mobilde sekmeli (**🚀 GEMİ SEÇİMİ & BAŞLA** vs **📋 KONTROLLER**), masaüstünde 2 kolonlu taşmayan modern düzen.

---

## 🛸 Hangar: 4 Gemi Modeli

1. ⚡ **VIPER:** Dengeli hız ve kalkan değerleriyle çevik önleme avcısı.
2. 🛡️ **TITAN:** Ağır zırh plakaları ve 4'lü ağır iticileriyle yüksek dayanıklılıklı dretnot.
3. 🔮 **PHANTOM:** İleri açılı ters kanatları ve plazma çizgileriyle hipersonik stealth korvet.
4. 🔥 **PHOENIX:** İkiz burunlu katamaran gövde ve süper hızlı kalkan şarjı olan taarruz avcısı.

---

## 🔫 7'li Silah Cephaneliği (4 Tier Evrim)

Seviye ilerledikçe silah teknolojileri Tier 1'den Tier 4 (Kuantum/Nebula) seviyesine evrilir:

1. **Plazma Topu** ➔ *Gatling* ➔ *Vulcan* ➔ *Omega Fırtınası* (Sonsuz Temel Silah)
2. **İkili Lazer** ➔ *Dörtlü Lazer (Quad)* ➔ *Foton Ağı* ➔ *Takyon Demeti* (Delici Yüksek Hız)
3. **Güdümlü Torpido** ➔ *İkiz Sürü* ➔ *Kuantum Füze* ➔ *Kıyamet Sürüsü* (Isı Güdümlü Akıllı Mühimmat)
4. **Saçma Plazma (Spread)** ➔ *Pentagon* ➔ *Nova Saçma* ➔ *Süpernova* (Geniş Alan Savunması)
5. **Ray Silahı (Railgun)** ➔ *Hiper Ray* ➔ *Anti-Madde Topu* ➔ *Nebula Işını* (Tek Vuruşta Çoklu Delme)
6. **Tesla Ark Topu** ➔ *İyon Yıldırım* ➔ *Şimşek Ağı* ➔ *Fırtına Zinciri* (Düşmanlar Arası Sıçrayan Şimşek)
7. **Kuantum Vorteks** ➔ *Tekillik Bombası* ➔ *Kuantum Çöküşü* ➔ *Kara Delik* (Yerçekimsel İç Patlama)

---

## 💣 Taktiksel Alan Mayınları (Sağ Tık)

* **Termonükleer Mayın:** 280m alanda 750 hasar veren devasa nükleer patlama.
* **EMP Şok Mayını:** 350m alanda elektrik şoku dalgası yayarak düşmanları sersemletir ve yavaşlatır.
* `Q` / `E` tuşları ile aralarında geçiş yapılabilir.

---

## 🕹️ Kontroller

### Masaüstü (Klavye & Fare)
| Eylem | Kontrol Tuşu |
| :--- | :--- |
| **Gemi Yönü** | Fare İmleci |
| **İtici (Motor)** | `SPACE` veya `W` / `↑` |
| **Seri Ateş** | Farenin Sol Tıkı |
| **Alan Mayını Bırak** | Farenin Sağ Tıkı |
| **Mayın Türü Değiştir** | `Q` / `E` Tuşları |
| **Silah Seçimi** | `1` - `7` Tuşları veya Fare Tekerleği |
| **Oyunu Duraklat** | `ESC` Tuşu veya `⏸️` Butonu |
| **Seviyeyi Başlat / Atla** | `ENTER` Tuşu |

### Mobil / Dokunmatik
| Eylem | Dokunmatik Kontrol |
| :--- | :--- |
| **Gemi Yönü & İtiş** | Sol Ekran Sanal Joystick |
| **Ateş Etme** | Sağ Ekran `ATEŞ` Butonu |
| **Hızlı İtici** | Sağ Ekran `İTİCİ` Butonu |
| **Mayın Bırakma** | Sağ Ekran `MAYIN` Butonu |
| **Silah Değiştirme** | Sağ Ekran `SİLAH` Butonu |

---

## ⚡ Kurulum ve Çalıştırma

Herhangi bir kurulum veya paket yöneticisi gerektirmez:
1. Projeyi indirin veya klonlayın:
   ```bash
   git clone https://github.com/begumszone/nebula-space.git
   ```
2. `index.html` dosyasına çift tıklayarak modern herhangi bir web tarayıcısında (Chrome, Edge, Firefox, Safari) doğrudan oynayın.
3. Canlı Sürüm (GitHub Pages): [https://begumszone.github.io/nebula-space/](https://begumszone.github.io/nebula-space/)
