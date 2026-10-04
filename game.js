/**
 * NEBULA SPACE - 40 Level Space Campaign
 * 
 * Mimari ve Özellikler:
 * 1. Tam Manuel Kontrol:
 *    - Fare: Yalnızca geminin burnunu ve nişan açısını belirler (Gemi fareye doğru kendiliğinden gitmez).
 *    - SPACE (veya W/Yukarı Ok): İtici motor (Gaz pedalı). Sınırsızdır, istendiği kadar basılabilir.
 *    - Farenin Sol Tıkı: Seri ateş! Kaç defa tıklanırsa o kadar anında mermi ateşler (Basılı tutulursa seri otomatik).
 *    - Farenin Sağ Tıkı: Taktik Alan Mayını bırakır.
 *    - Q / E Tuşları: 2 çeşit mayın arasında anında geçiş yapar (Termonükleer <-> EMP).
 * 
 * 2. Hangar / 4 Farklı Gemi Modeli:
 *    - VIPER: Önleme avcısı (Dengeli, seri ve çevik, cyan/mavi neon)
 *    - TITAN: Ağır zırhlı kruvazör (140 HP, 85 Kalkan, güçlü zırh gövdesi, kehribar/altın)
 *    - PHANTOM: Ters kanatlı stealth korvet (890 hız, aşırı kıvrak, mor/eflatun neon)
 *    - PHOENIX: Çift gövdeli katamaran taarruz avcısı (Çok hızlı kalkan şarjı, zümrüt yeşili)
 * 
 * 3. 7 Çeşit Evrimleşen Silah (1 - 7 Tuşları & 4 Tier):
 *    - 1: Plazma -> Gatling -> Vulcan -> Omega Fırtınası
 *    - 2: İkili Lazer -> Dörtlü Lazer (Quad) -> Foton Ağı -> Takyon Demeti
 *    - 3: Güdümlü Füze -> İkiz Sürü Füzeleri -> Kuantum Torpido -> Kıyamet Sürüsü
 *    - 4: Saçma -> Pentagon -> Nova Saçma -> Süpernova
 *    - 5: Ray Silahı -> Hiper Ray -> Anti-Madde -> Nebula Ölüm Işını
 *    - 6: Tesla Ark Topu -> İyon Yıldırımı -> Şimşek Ağı -> Fırtına Zinciri (Hedeflere zincirleme sıçrar)
 *    - 7: Kuantum Vorteks -> Yerçekimi Tekilliği -> Kuantum Çöküşü -> Kara Delik Bombası (Düşmanları içine çeker ve patlar)
 * 
 * 4. Stratejik İkmal & Düşman Ganimeti Sistemi:
 *    - Kapsüller bölüm başlangıcında haritaya sabit olarak konuşlandırılır.
 *    - Savaş esnasında YALNIZCA düşmanlar yok edildiğinde ganimet olarak düşer.
 *    - Manyetik Çekim (Tractor Beam): 280m yakınına gelindiğinde mıknatıs gibi gemiye çekilir.
 *    - "HAK / ONARIM KİTİ": Canı +40 onarır, kalkanı %100 doldurur, +2 mayın verir.
 * 
 * 5. 2 Tip Alan Etkili Mayın:
 *    - 0: Termonükleer Mayın (280px alan, 750 hasar, tüm filoyu silen devasa alev dalgası)
 *    - 1: EMP Şok Mayını (350px alan, 480 hasar, elektrik fırtınası + düşmanları %55 yavaşlatma)
 * 
 * 6. 5 Farklı Düşman Türü & 40 Kademeli Bölüm & ESC Duraklatma
 */

// --- 1. ŞOK DALGASI (PATLAYAN MAYIN / FÜZE / VORTEKS ALAN EFEKTİ) ---
class Shockwave {
  constructor(x, y, maxRadius, color) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.color = color;
    this.radius = 12;
    this.life = 0.44;
    this.maxLife = 0.44;
  }

  update(dt) {
    this.life -= dt;
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    this.radius = 12 + (this.maxRadius - 12) * Math.sin(progress * Math.PI * 0.5);
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 24;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4 * alpha + 1.2;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha * 0.16;
    ctx.fill();

    ctx.restore();
  }
}

// --- 2. GELİŞMİŞ VE YUMUŞAK SES MOTORU (WEB AUDIO API) ---
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.musicGain = null;
    this.musicStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMusic();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(this.musicEnabled ? 0.035 : 0.0001, this.ctx.currentTime + 0.5);
    }
    return this.musicEnabled;
  }

  setupMusic() {
    if (!this.ctx) return;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.035 : 0.0001, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const chords = [
      [146.83, 220.00, 261.63, 349.23],
      [116.54, 174.61, 233.08, 293.66],
      [98.00, 146.83, 196.00, 293.66],
      [110.00, 164.81, 220.00, 277.18]
    ];

    const playStep = () => {
      if (!this.ctx || !this.musicEnabled) {
        setTimeout(playStep, 4000);
        return;
      }
      const chord = chords[this.musicStep % chords.length];
      this.musicStep++;
      const now = this.ctx.currentTime;
      const duration = 4.2;

      chord.forEach((freq, idx) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
          gain.gain.linearRampToValueAtTime(0.0001, now + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + duration);
        } catch (e) {}
      });

      setTimeout(playStep, 3800);
    };

    playStep();
  }

  playShoot(type) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'YELLOW_BLASTER') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
      } else if (type === 'RED_LASER') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.07);
      } else if (type === 'HOMING_MISSILE') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.linearRampToValueAtTime(460, now + 0.14);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'SPREAD_CANNON') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.11);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.11);
      } else if (type === 'RAILGUN') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'TESLA_ARC') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.12);
      } else if (type === 'VORTEX_BOMB') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.25);
      }
    } catch (e) {}
  }

  playTeslaArcChain() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.08);
    } catch (e) {}
  }

  playVortexImplosion() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.45);
    } catch (e) {}
  }

  playMineDeploy() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    } catch (e) {}
  }

  playEMP() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.4);
    } catch (e) {}
  }

  playExplosion(heavy = false) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const dur = heavy ? 0.38 : 0.18;
      osc.frequency.setValueAtTime(heavy ? 90 : 160, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + dur);
      gain.gain.setValueAtTime(heavy ? 0.18 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + dur);
    } catch (e) {}
  }

  playShieldHit() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } catch (e) {}
  }

  playLevelComplete() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554, 659, 880, 1108].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(start); osc.stop(start + 0.16);
      });
    } catch (e) {}
  }

  playPortalOpen() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [220, 330, 440, 660, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, start + 0.4);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(start); osc.stop(start + 0.45);
      });
    } catch (e) {}
  }

  playWarpJump() {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.7);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.25);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(now); osc.stop(now + 1.25);
    } catch (e) {}
  }

  playPickup(isHealth = false) {
    if (!this.sfxEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = isHealth ? [523, 659, 784, 1046] : [587, 880, 1174];
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + i * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.06, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.1);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(st); osc.stop(st + 0.1);
      });
    } catch (e) {}
  }
}

// --- 3. PARTİKÜL SİSTEMİ ---
class Particle {
  constructor(x, y, color, size, speed, angle, life, isSmoke = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = life;
    this.maxLife = life;
    this.isSmoke = isSmoke;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
    if (this.isSmoke) this.size += dt * 8;
    this.life -= dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = this.isSmoke ? 2 : 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.5, this.size * (this.isSmoke ? 1 : alpha)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- 4. 2 ÇEŞİT ALAN ETKİLİ MAYIN (SAĞ TIK) ---
class DeployableMine {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 0: TERMONÜKLEER, 1: EMP ŞOK
    this.armTimer = 0.22;
    this.life = 75;
    this.radius = 18;
    this.triggerRadius = 80;
    this.pulse = 0;

    if (type === 0) {
      this.name = 'TERMONÜKLEER MAYIN';
      this.color = '#ff4400';
      this.aoeRadius = 280;
      this.damage = 750;
    } else {
      this.name = 'EMP ŞOK MAYINI';
      this.color = '#00d2ff';
      this.aoeRadius = 350;
      this.damage = 480;
    }
  }

  update(dt) {
    this.life -= dt;
    this.pulse += dt * 6;
    if (this.armTimer > 0) this.armTimer -= dt;
  }

  isArmed() {
    return this.armTimer <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const armed = this.isArmed();
    const blink = Math.sin(this.pulse) > 0;

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(14, 18, 34, 0.95)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.8;

    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      ctx.stroke();
    }

    ctx.fillStyle = armed ? (blink ? '#ffffff' : this.color) : '#555555';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.triggerRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

// --- 4.5 TAŞIYICI SAVAŞ GEMİSİ / WARP ATLAMA PORTALI (MOTHERSHIP DOCKING) ---
class MothershipGate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 120;
    this.rotation = 0;
    this.pulse = 0;
    this.docked = false;
    this.dockTimer = 0;
  }

  update(dt, player) {
    this.rotation += dt * 1.5;
    this.pulse += dt * 4;

    if (this.docked) {
      this.dockTimer += dt;
      return;
    }

    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < 95) {
        this.docked = true;
        this.dockTimer = 0;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const pulseScale = 1 + Math.sin(this.pulse) * 0.08;

    // 1. Dış Taşıyıcı Savaş Gemisi Gövdesi & İniş İskelesi
    ctx.save();
    ctx.rotate(this.rotation * 0.35);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = 'rgba(6, 14, 34, 0.95)';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#00f0ff';

    // 6 Ağır Zırh Kanadı & İniş Hangar Işıkları
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(68, -20);
      ctx.lineTo(125, -14);
      ctx.lineTo(142, 0);
      ctx.lineTo(125, 14);
      ctx.lineTo(68, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Yanıp Sönen Yeşil İniş Işıkları
      const blink = Math.sin(this.pulse * 2.5 + i) > 0;
      ctx.fillStyle = blink ? '#00ffaa' : '#004d33';
      ctx.beginPath();
      ctx.arc(122, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();

    // 2. Dönen İç Enerji Çemberi
    ctx.save();
    ctx.rotate(-this.rotation * 1.1);
    ctx.scale(pulseScale, pulseScale);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 56, Math.sin(a) * 56);
      ctx.lineTo(Math.cos(a) * 78, Math.sin(a) * 78);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Merkez Hiperuzay Solucan Deliği (Vortex Portal)
    ctx.save();
    ctx.rotate(this.rotation * 2.2);
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 56);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#00f0ff');
    grad.addColorStop(0.7, '#7928ca');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.fill();

    // Kuantum Çekim Spiralleri
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      ctx.rotate((Math.PI * 2) / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(28, 22, 50, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Hangar Başlığı
    ctx.save();
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f0ff';
    ctx.fillText('TAŞIYICI SAVAŞ GEMİSİ / WARP KAPISI', 0, 160);
    ctx.font = 'bold 10px Rajdhani, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DÖNÜŞ İÇİN MERKEZE GİRİŞ YAPIN [DOCKING]', 0, 176);
    ctx.restore();

    ctx.restore();
  }
}

// --- 5. İKMAL KAPSÜLLERİ (7 SİLAH + HAK/ONARIM KİTİ) + MANYETİK ÇEKİM ---
class SupplyPickup {
  constructor(x, y, typeIndex, isPermanent = false, tier = 1) {
    this.x = x;
    this.y = y;
    this.typeIndex = typeIndex; // 0-6: Silahlar, 7: HAK/ONARIM KİTİ
    this.isPermanent = isPermanent;
    this.tier = tier;
    this.radius = 19;
    this.pulse = Math.random() * Math.PI * 2;
    this.life = isPermanent ? Infinity : 100;

    const namesByTier = [
      ['PLAZMA', 'İKİLİ LAZER', 'GÜDÜMLÜ FÜZE', 'SAÇMA', 'RAY SİLAHI', 'TESLA ARK', 'VORTEKS', 'HAK / ONARIM'],
      ['GATLING', 'DÖRTLÜ LAZER', 'İKİZ FÜZE', 'PENTAGON', 'HİPER RAY', 'İYON YILDIRIM', 'TEKİLLİK BOMBASI', 'HAK / ONARIM'],
      ['VULCAN', 'FOTON LAZER', 'KUANTUM FÜZE', 'NOVA SAÇMA', 'ANTİ-MADDE', 'ŞİMŞEK AĞI', 'KUANTUM ÇÖKÜŞ', 'HAK / ONARIM'],
      ['OMEGA FIRTINA', 'TAKYON AĞI', 'KIYAMET SÜRÜSÜ', 'SÜPERNOVA', 'NEBULA IŞINI', 'FIRTINA ZİNCİRİ', 'KARA DELİK', 'HAK / ONARIM']
    ];
    const colors = ['#ffe600', '#ff2a2a', '#00d2ff', '#b537f2', '#00ff88', '#00ffff', '#9d00ff', '#00ffaa'];

    this.color = colors[typeIndex] || '#00f0ff';
    this.name = namesByTier[tier - 1] ? namesByTier[tier - 1][typeIndex] : namesByTier[0][typeIndex];
  }

  update(player, dt, particles) {
    this.pulse += dt * 4;
    if (!this.isPermanent) {
      this.life -= dt;
    }

    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < 280) {
        const pullSpeed = (1 - dist / 280) * 750 + 280;
        const pullAngle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(pullAngle) * pullSpeed * dt;
        this.y += Math.sin(pullAngle) * pullSpeed * dt;

        if (Math.random() < 0.28 && particles) {
          particles.push(new Particle(
            this.x,
            this.y,
            this.color,
            Math.random() * 2.5 + 1.5,
            Math.random() * 50 + 20,
            pullAngle + Math.PI,
            0.22
          ));
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const scale = 1 + Math.sin(this.pulse) * 0.14;
    ctx.scale(scale, scale);

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(6, 14, 30, 0.92)';

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * 17;
      const py = Math.sin(a) * 17;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (this.typeIndex === 7) {
      // HAK / CAN ONARIM KİTİ (+)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ffaa';
      ctx.fillRect(-2.5, -8, 5, 16);
      ctx.fillRect(-8, -2.5, 16, 5);
    } else {
      ctx.rotate(this.pulse);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    ctx.restore();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillText(this.name, 0, 28);
    ctx.restore();
  }
}

// --- 6. MERMİ SİSTEMİ (7 SİLAH, 4 TIER) ---
class Projectile {
  constructor(x, y, angle, type, tier = 1, targetEnemy = null) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.type = type;
    this.tier = tier;
    this.targetEnemy = targetEnemy;
    this.life = 2.5;
    this.pierce = 1;
    this.aoeRadius = 0;
    this.vortexTimer = 0;

    switch (type) {
      case 'YELLOW_BLASTER':
        this.speed = 1250 + (tier - 1) * 150;
        this.damage = [38, 48, 62, 80][tier - 1] || 38;
        this.color = ['#ffe600', '#ffcc00', '#ff9900', '#ff5500'][tier - 1] || '#ffe600';
        this.length = 16 + (tier - 1) * 4;
        this.radius = 4 + (tier - 1) * 0.8;
        break;

      case 'RED_LASER':
        this.speed = 1550 + (tier - 1) * 180;
        this.damage = [56, 68, 88, 110][tier - 1] || 56;
        this.color = ['#ff2a2a', '#ff1144', '#ff0066', '#ff0033'][tier - 1] || '#ff2a2a';
        this.length = 26 + (tier - 1) * 6;
        this.radius = 5 + (tier - 1) * 0.7;
        this.pierce = [2, 3, 4, 6][tier - 1] || 2;
        break;

      case 'HOMING_MISSILE':
        this.speed = 520 + (tier - 1) * 60;
        this.maxSpeed = 1020 + (tier - 1) * 140;
        this.damage = [135, 160, 210, 270][tier - 1] || 135;
        this.color = ['#00d2ff', '#00b4ff', '#00e5ff', '#7000ff'][tier - 1] || '#00d2ff';
        this.length = 18 + (tier - 1) * 3;
        this.radius = 6 + (tier - 1) * 0.8;
        this.turnSpeed = 5.4 + (tier - 1) * 0.7;
        this.aoeRadius = [130, 150, 190, 240][tier - 1] || 130;
        this.trailTimer = 0;
        break;

      case 'SPREAD_CANNON':
        this.speed = 1100 + (tier - 1) * 120;
        this.damage = [26, 36, 46, 60][tier - 1] || 26;
        this.color = ['#b537f2', '#c644fc', '#d855ff', '#ea66ff'][tier - 1] || '#b537f2';
        this.length = 12 + (tier - 1) * 3;
        this.radius = 4.5 + (tier - 1) * 0.6;
        this.life = 1.15;
        break;

      case 'RAILGUN':
        this.speed = 2500 + (tier - 1) * 400;
        this.damage = [195, 290, 420, 600][tier - 1] || 195;
        this.color = ['#00ff88', '#00ffaa', '#00ffcc', '#33ffdd'][tier - 1] || '#00ff88';
        this.length = 45 + (tier - 1) * 12;
        this.radius = 7 + (tier - 1) * 2.5;
        this.pierce = [5, 8, 12, 20][tier - 1] || 5;
        break;

      case 'TESLA_ARC':
        this.speed = 1600;
        this.damage = [50, 70, 95, 135][tier - 1] || 50;
        this.color = '#00ffff';
        this.length = 20;
        this.radius = 5.5;
        this.chainCount = [2, 3, 4, 6][tier - 1] || 2;
        break;

      case 'VORTEX_BOMB':
        this.speed = 360;
        this.damage = [220, 320, 450, 650][tier - 1] || 220; // Çöküş patlama hasarı
        this.color = '#9d00ff';
        this.length = 16;
        this.radius = 10 + (tier - 1) * 2;
        this.life = 1.5; // 1.5 sn sonra çöker
        this.aoeRadius = [190, 230, 270, 330][tier - 1] || 190;
        this.pullPower = 340 + (tier - 1) * 60;
        break;
    }

    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(dt, enemies, particles) {
    this.life -= dt;

    if (this.type === 'HOMING_MISSILE') {
      if (!this.targetEnemy || this.targetEnemy.dead) {
        let minDist = 1600;
        this.targetEnemy = null;
        for (const e of enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) {
            minDist = d;
            this.targetEnemy = e;
          }
        }
      }

      if (this.targetEnemy) {
        const targetAngle = Math.atan2(this.targetEnemy.y - this.y, this.targetEnemy.x - this.x);
        let diff = targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.angle += diff * Math.min(1, this.turnSpeed * dt);
      }

      this.speed = Math.min(this.maxSpeed, this.speed + 500 * dt);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;

      this.trailTimer += dt;
      if (this.trailTimer > 0.02) {
        this.trailTimer = 0;
        const backAngle = this.angle + Math.PI + (Math.random() - 0.5) * 0.4;
        particles.push(new Particle(
          this.x,
          this.y,
          Math.random() > 0.3 ? this.color : '#ffffff',
          Math.random() * 3 + 2,
          Math.random() * 50 + 20,
          backAngle,
          0.3,
          true
        ));
      }
    } else if (this.type === 'VORTEX_BOMB') {
      this.vortexTimer += dt * 8;
      // Vorteks çevresindeki düşmanları kendine doğru çeker
      for (const e of enemies) {
        if (e.dead) continue;
        const dist = Math.hypot(this.x - e.x, this.y - e.y);
        if (dist < this.aoeRadius) {
          const pullAngle = Math.atan2(this.y - e.y, this.x - e.x);
          const pullSpeed = (1 - dist / this.aoeRadius) * this.pullPower;
          e.x += Math.cos(pullAngle) * pullSpeed * dt;
          e.y += Math.sin(pullAngle) * pullSpeed * dt;
          e.hp -= 22 * dt; // Sürekli çekim basıncı hasarı
        }
      }

      if (Math.random() < 0.4) {
        const pAngle = Math.random() * Math.PI * 2;
        particles.push(new Particle(
          this.x + Math.cos(pAngle) * 35,
          this.y + Math.sin(pAngle) * 35,
          '#b537f2',
          2.5,
          60,
          pAngle + Math.PI,
          0.2
        ));
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 16;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.type === 'RAILGUN' ? (6 + (this.tier - 1) * 3) : (this.type === 'RED_LASER' ? (4.5 + (this.tier - 1)) : 3.5);
    ctx.lineCap = 'round';

    if (this.type === 'HOMING_MISSILE') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(12 + this.tier * 2, 0);
      ctx.lineTo(-8, -5);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(-7, 0, 3 + this.tier * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'TESLA_ARC') {
      // Elektrik şimşek cıvatası
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(4, -5);
      ctx.lineTo(0, 4);
      ctx.lineTo(-6, -3);
      ctx.lineTo(-12, 0);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(4, -5);
      ctx.lineTo(0, 4);
      ctx.lineTo(-6, -3);
      ctx.lineTo(-12, 0);
      ctx.stroke();
    } else if (this.type === 'VORTEX_BOMB') {
      // Kara delik / Vorteks küresi
      ctx.rotate(this.vortexTimer);
      ctx.fillStyle = '#06020c';
      ctx.strokeStyle = '#9d00ff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dönen dış yerçekimi halkaları
      ctx.strokeStyle = '#e070ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, Math.PI, Math.PI * 2.4);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.length / 2, 0);
      ctx.lineTo(-this.length / 2, 0);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(this.length / 4, 0);
      ctx.lineTo(-this.length / 4, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// --- 7. DÜŞMANLAR (5 FARKLI TÜR) ---

class ShadowInterceptor {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.hp = 45;
    this.maxHp = 45;
    this.speed = 185;
    this.color = '#ff007f';
    this.type = 'SCOUT';
    this.angle = 0;
    this.dead = false;
    this.strobe = Math.random() * 10;
  }

  update(player, dt) {
    this.strobe += dt * 4;
    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
    this.angle = baseAngle + Math.sin(this.strobe) * 0.45;
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 14;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(28, 4, 22, 0.94)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-8, -16);
    ctx.lineTo(-4, -6);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-4, 6);
    ctx.lineTo(-8, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff007f';
    ctx.fillRect(8, -6, 8, 2.5);
    ctx.fillRect(8, 3.5, 8, 2.5);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class HeavyDreadnought {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 34;
    this.hp = 280;
    this.maxHp = 280;
    this.speed = 68;
    this.color = '#ffaa00';
    this.type = 'HARVESTER';
    this.angle = 0;
    this.dead = false;
  }

  update(player, dt) {
    this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(28, 16, 4, 0.95)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(12, -22);
    ctx.lineTo(-24, -20);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-24, 20);
    ctx.lineTo(12, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff8800';
    ctx.fillRect(-6, -10, 16, 20);

    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(4, -16, 4, 0, Math.PI * 2);
    ctx.arc(4, 16, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-this.angle);
    const barW = 46;
    const barH = 5;
    const pct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barW / 2, -this.radius - 14, barW, barH);
    ctx.fillStyle = this.color;
    ctx.fillRect(-barW / 2, -this.radius - 14, barW * pct, barH);

    ctx.restore();
  }
}

class CosmicLeviathan {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = 'DEATH_WORM';
    this.color = '#9d00ff';
    this.maxHp = 460;
    this.hp = 460;
    this.speed = 145;
    this.radius = 24;
    this.segmentRadius = 16;
    this.segmentDist = 20;
    this.dead = false;

    this.angle = Math.random() * Math.PI * 2;
    this.waveTimer = Math.random() * 10;

    this.segments = [];
    for (let i = 0; i < 14; i++) {
      this.segments.push({
        x: x - i * this.segmentDist,
        y: y,
        radius: Math.max(7, this.segmentRadius - i * 0.7)
      });
    }
  }

  update(player, dt) {
    this.waveTimer += dt * 4.2;
    const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);

    let diff = targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.angle += diff * Math.min(1, 2.0 * dt);
    const slitherAngle = this.angle + Math.sin(this.waveTimer) * 0.55;

    this.x += Math.cos(slitherAngle) * this.speed * dt;
    this.y += Math.sin(slitherAngle) * this.speed * dt;

    let prevX = this.x;
    let prevY = this.y;

    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const dx = prevX - seg.x;
      const dy = prevY - seg.y;
      const angle = Math.atan2(dy, dx);

      seg.x = prevX - Math.cos(angle) * this.segmentDist;
      seg.y = prevY - Math.sin(angle) * this.segmentDist;

      prevX = seg.x;
      prevY = seg.y;
    }
  }

  checkHit(px, py, radius) {
    if (Math.hypot(this.x - px, this.y - py) < this.radius + radius) return true;
    for (const seg of this.segments) {
      if (Math.hypot(seg.x - px, seg.y - py) < seg.radius + radius) return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = this.color;

    for (let i = this.segments.length - 1; i >= 0; i--) {
      const seg = this.segments[i];
      ctx.save();
      ctx.translate(seg.x, seg.y);

      ctx.fillStyle = `rgba(38, 2, 60, ${0.85 + (1 - i / this.segments.length) * 0.15})`;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, 0, seg.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(-seg.radius * 0.5, 0);
      ctx.lineTo(0, -seg.radius * 1.35);
      ctx.lineTo(seg.radius * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = 'rgba(50, 0, 80, 0.96)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.5, -12);
    ctx.lineTo(this.radius * 1.45, -6);
    ctx.lineTo(this.radius * 0.8, 0);
    ctx.moveTo(this.radius * 0.5, 12);
    ctx.lineTo(this.radius * 1.45, 6);
    ctx.lineTo(this.radius * 0.8, 0);
    ctx.stroke();

    ctx.fillStyle = '#ff0033';
    ctx.shadowColor = '#ff0033';
    ctx.beginPath();
    ctx.arc(8, -8, 3.5, 0, Math.PI * 2);
    ctx.arc(8, 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-this.angle);
    const barW = 50;
    const barH = 5;
    const pct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barW / 2, -this.radius - 14, barW, barH);
    ctx.fillStyle = this.color;
    ctx.fillRect(-barW / 2, -this.radius - 14, barW * pct, barH);

    ctx.restore();
  }
}

class PlasmaMine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.hp = 30;
    this.maxHp = 30;
    this.speed = 195;
    this.color = '#ff2a2a';
    this.type = 'MINE';
    this.spin = 0;
    this.pulse = 0;
    this.dead = false;
  }

  update(player, dt) {
    this.spin += dt * 4;
    this.pulse += dt * 8;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.spin);

    ctx.shadowBlur = 16;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(35, 5, 5, 0.92)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
      ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const p = Math.sin(this.pulse) > 0;
    ctx.fillStyle = p ? '#ffffff' : '#ff0033';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class SniperSloop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22;
    this.hp = 90;
    this.maxHp = 90;
    this.speed = 135;
    this.color = '#ff0033';
    this.type = 'SNIPER';
    this.angle = 0;
    this.dead = false;
    this.strafeDir = Math.random() < 0.5 ? 1 : -1;
    this.strafeTimer = 0;
  }

  update(player, dt) {
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    this.angle = Math.atan2(player.y - this.y, player.x - this.x);

    this.strafeTimer += dt;
    if (this.strafeTimer > 2.5) {
      this.strafeTimer = 0;
      this.strafeDir *= -1;
    }

    if (dist > 220) {
      this.x += Math.cos(this.angle) * this.speed * dt;
      this.y += Math.sin(this.angle) * this.speed * dt;
    } else {
      const strafeAngle = this.angle + (Math.PI / 2) * this.strafeDir;
      this.x += Math.cos(strafeAngle) * (this.speed * 0.9) * dt;
      this.y += Math.sin(strafeAngle) * (this.speed * 0.9) * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(38, 5, 12, 0.96)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.8;

    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(8, -8);
    ctx.lineTo(-16, -16);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-16, 16);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff0033';
    ctx.beginPath();
    ctx.arc(14, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 0, 51, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(140, 0);
    ctx.stroke();

    ctx.rotate(-this.angle);
    const barW = 36;
    const barH = 4;
    const pct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barW / 2, -this.radius - 12, barW, barH);
    ctx.fillStyle = this.color;
    ctx.fillRect(-barW / 2, -this.radius - 12, barW * pct, barH);

    ctx.restore();
  }
}

// --- 8. OYUNCU GEMİSİ (HANGAR MODEL SEÇİMİ & 7 SİLAH KULLANIMI) ---
class Player {
  constructor(x, y, shipType = 'VIPER') {
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.radius = 20;

    this.shieldRechargeDelay = 0;
    this.invulnerableTimer = 0;

    // 7 Silah Envanteri
    this.weaponIndex = 0;
    this.ammo = [Infinity, 160, 28, 100, 20, 70, 14];
    this.fireTimer = 999;

    // 2 Mayın Türü
    this.mineIndex = 0;
    this.mineAmmo = 8;
    this.mineCooldown = 0;

    this.roll = 0;
    this.strobeTimer = 0;

    this.applyShipProfile(shipType);
  }

  // HANGARDA SEÇİLEN GEMİ MODELİ VE NİTELİKLERİ
  applyShipProfile(type) {
    this.shipType = type || 'VIPER';

    if (this.shipType === 'TITAN') {
      this.name = 'TITAN';
      this.color = '#ffaa00';
      this.maxHp = 140;
      this.hp = 140;
      this.maxShield = 85;
      this.shield = 85;
      this.thrustPower = 900;
      this.maxSpeed = 730;
      this.friction = 0.985;
      this.shieldRechargeRate = 18;
    } else if (this.shipType === 'PHANTOM') {
      this.name = 'PHANTOM';
      this.color = '#b537f2';
      this.maxHp = 80;
      this.hp = 80;
      this.maxShield = 70;
      this.shield = 70;
      this.thrustPower = 1100;
      this.maxSpeed = 890;
      this.friction = 0.980;
      this.shieldRechargeRate = 22;
    } else if (this.shipType === 'PHOENIX') {
      this.name = 'PHOENIX';
      this.color = '#00ffaa';
      this.maxHp = 95;
      this.hp = 95;
      this.maxShield = 95;
      this.shield = 95;
      this.thrustPower = 960;
      this.maxSpeed = 810;
      this.friction = 0.982;
      this.shieldRechargeRate = 32; // Katamaran enerji avantajı
    } else {
      // VIPER (Varsayılan Önleme Avcısı)
      this.name = 'VIPER';
      this.color = '#00f0ff';
      this.maxHp = 100;
      this.hp = 100;
      this.maxShield = 60;
      this.shield = 60;
      this.thrustPower = 980;
      this.maxSpeed = 840;
      this.friction = 0.982;
      this.shieldRechargeRate = 20;
    }
  }

  setWeaponIndex(idx) {
    if (idx >= 0 && idx < 7) this.weaponIndex = idx;
  }

  toggleMine() {
    this.mineIndex = this.mineIndex === 0 ? 1 : 0;
    return this.mineIndex;
  }

  takeDamage(amount, sound) {
    if (this.invulnerableTimer > 0) return false;

    this.invulnerableTimer = 0.45;
    this.shieldRechargeDelay = this.shipType === 'PHOENIX' ? 1.6 : 2.5;

    if (this.shield > 0) {
      sound.playShieldHit();
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      const remainder = amount - absorbed;
      if (remainder > 0) this.hp -= remainder;
    } else {
      this.hp -= amount;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      return true;
    }
    return false;
  }

  // TIKLAMA BAŞINA ANINDA SERİ ATEŞ & 7 SİLAH TIER EVRİMİ
  tryShoot(dt, bullets, particles, sound, isInstantClick = false, tier = 1) {
    this.fireTimer += dt;

    const baseDelays = [0.12, 0.08, 0.25, 0.28, 0.48, 0.22, 0.65];
    const tierSpeedMult = [1, 0.90, 0.82, 0.74][tier - 1] || 1;
    const delay = baseDelays[this.weaponIndex] * tierSpeedMult;

    if (isInstantClick) {
      if (this.fireTimer < 0.035) return;
    } else {
      if (this.fireTimer < delay) return;
    }

    if (this.ammo[this.weaponIndex] <= 0) {
      this.weaponIndex = 0;
    }

    this.fireTimer = 0;
    const baseAngle = this.angle;

    switch (this.weaponIndex) {
      case 0: // 1: PLAZMA / GATLING / VULCAN / OMEGA
        if (tier === 1 || tier === 2) {
          bullets.push(new Projectile(this.x, this.y, baseAngle, 'YELLOW_BLASTER', tier));
        } else if (tier === 3) {
          const offset = 7;
          bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * offset, this.y + Math.sin(baseAngle - Math.PI / 2) * offset, baseAngle, 'YELLOW_BLASTER', tier));
          bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * offset, this.y + Math.sin(baseAngle + Math.PI / 2) * offset, baseAngle, 'YELLOW_BLASTER', tier));
        } else {
          const offset = 8;
          bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * offset, this.y + Math.sin(baseAngle - Math.PI / 2) * offset, baseAngle - 0.02, 'YELLOW_BLASTER', tier));
          bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * offset, this.y + Math.sin(baseAngle + Math.PI / 2) * offset, baseAngle + 0.02, 'YELLOW_BLASTER', tier));
        }
        sound.playShoot('YELLOW_BLASTER');
        break;

      case 1: // 2: İKİLİ LAZER / DÖRTLÜ LAZER (QUAD) / FOTON AĞI / TAKYON DEMETİ
        if (tier === 1) {
          const w = 16;
          bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * w, this.y + Math.sin(baseAngle - Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
          bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * w, this.y + Math.sin(baseAngle + Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
        } else if (tier === 2 || tier === 3) {
          [10, 22].forEach((w) => {
            bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * w, this.y + Math.sin(baseAngle - Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
            bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * w, this.y + Math.sin(baseAngle + Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
          });
        } else {
          [7, 18, 28].forEach((w) => {
            bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * w, this.y + Math.sin(baseAngle - Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
            bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * w, this.y + Math.sin(baseAngle + Math.PI / 2) * w, baseAngle, 'RED_LASER', tier));
          });
        }
        this.ammo[1] = Math.max(0, this.ammo[1] - 2);
        sound.playShoot('RED_LASER');
        break;

      case 2: // 3: GÜDÜMLÜ FÜZE / İKİZ SÜRÜ / KUANTUM / KIYAMET SÜRÜSÜ
        if (tier === 1) {
          bullets.push(new Projectile(this.x, this.y, baseAngle, 'HOMING_MISSILE', tier));
        } else if (tier === 2 || tier === 3) {
          bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * 16, this.y + Math.sin(baseAngle - Math.PI / 2) * 16, baseAngle - 0.14, 'HOMING_MISSILE', tier));
          bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * 16, this.y + Math.sin(baseAngle + Math.PI / 2) * 16, baseAngle + 0.14, 'HOMING_MISSILE', tier));
        } else {
          bullets.push(new Projectile(this.x + Math.cos(baseAngle - Math.PI / 2) * 20, this.y + Math.sin(baseAngle - Math.PI / 2) * 20, baseAngle - 0.20, 'HOMING_MISSILE', tier));
          bullets.push(new Projectile(this.x, this.y, baseAngle, 'HOMING_MISSILE', tier));
          bullets.push(new Projectile(this.x + Math.cos(baseAngle + Math.PI / 2) * 20, this.y + Math.sin(baseAngle + Math.PI / 2) * 20, baseAngle + 0.20, 'HOMING_MISSILE', tier));
        }
        this.ammo[2] = Math.max(0, this.ammo[2] - 1);
        sound.playShoot('HOMING_MISSILE');
        break;

      case 3: // 4: SAÇMA / PENTAGON / NOVA / SÜPERNOVA
        const count = tier === 1 ? 3 : (tier === 2 ? 5 : (tier === 3 ? 7 : 9));
        const half = Math.floor(count / 2);
        const spreadStep = count > 5 ? 0.09 : 0.12;
        for (let i = -half; i <= half; i++) {
          bullets.push(new Projectile(this.x, this.y, baseAngle + i * spreadStep, 'SPREAD_CANNON', tier));
        }
        this.ammo[3] = Math.max(0, this.ammo[3] - 1);
        sound.playShoot('SPREAD_CANNON');
        break;

      case 4: // 5: RAY SİLAHI / HİPER RAY / ANTİ-MADDE / NEBULA OBLIVION
        bullets.push(new Projectile(this.x, this.y, baseAngle, 'RAILGUN', tier));
        this.ammo[4] = Math.max(0, this.ammo[4] - 1);
        sound.playShoot('RAILGUN');
        break;

      case 5: // 6: TESLA ARK TOPU (ZİNCİRLEME ŞİMŞEK)
        bullets.push(new Projectile(this.x, this.y, baseAngle, 'TESLA_ARC', tier));
        this.ammo[5] = Math.max(0, this.ammo[5] - 1);
        sound.playShoot('TESLA_ARC');
        break;

      case 6: // 7: KUANTUM VORTEKS (KARA DELİK BOMBASI)
        bullets.push(new Projectile(this.x, this.y, baseAngle, 'VORTEX_BOMB', tier));
        this.ammo[6] = Math.max(0, this.ammo[6] - 1);
        sound.playShoot('VORTEX_BOMB');
        break;
    }

    particles.push(new Particle(
      this.x + Math.cos(baseAngle) * 24,
      this.y + Math.sin(baseAngle) * 24,
      '#ffffff',
      3.5,
      90,
      baseAngle + (Math.random() - 0.5) * 0.4,
      0.16
    ));
  }

  // SAĞ TIK ALAN MAYINI BIRAKMA
  dropMine(mines, sound) {
    if (this.mineAmmo <= 0 || this.mineCooldown > 0) return false;

    this.mineAmmo--;
    this.mineCooldown = 0.35;

    const mx = this.x - Math.cos(this.angle) * 25;
    const my = this.y - Math.sin(this.angle) * 25;

    mines.push(new DeployableMine(mx, my, this.mineIndex));
    sound.playMineDeploy();
    return true;
  }

  update(dt, targetAimAngle, isThrusting, particles) {
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.mineCooldown > 0) this.mineCooldown -= dt;

    if (this.shieldRechargeDelay > 0) {
      this.shieldRechargeDelay -= dt;
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRechargeRate * dt);
    }

    let diff = targetAimAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.angle += diff * Math.min(1, 16 * dt);

    const targetRoll = Math.max(-0.6, Math.min(0.6, diff * 12 * 0.12));
    this.roll += (targetRoll - this.roll) * Math.min(1, 10 * dt);

    if (isThrusting) {
      this.vx += Math.cos(this.angle) * this.thrustPower * dt;
      this.vy += Math.sin(this.angle) * this.thrustPower * dt;

      const backAngle = this.angle + Math.PI + (Math.random() - 0.5) * 0.4;
      particles.push(new Particle(
        this.x - Math.cos(this.angle) * 20,
        this.y - Math.sin(this.angle) * 20,
        Math.random() > 0.3 ? this.color : '#ffe600',
        Math.random() * 3 + 2,
        Math.random() * 120 + 60,
        backAngle,
        0.35
      ));
    }

    this.vx *= Math.pow(this.friction, dt * 60);
    this.vy *= Math.pow(this.friction, dt * 60);

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.strobeTimer += dt * 5;
  }

  // 4 FARKLI GEMİ MODELİNİN ÖZEL ÇİZİMLERİ
  draw(ctx, isThrusting) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const rollScaleY = Math.cos(this.roll);
    ctx.scale(1, rollScaleY);

    // KALKAN HALKASI
    if (this.shield > 5) {
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.25 + (this.shield / this.maxShield) * 0.4;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;

    if (this.shipType === 'TITAN') {
      // --- GEMİ 2: TITAN (AĞIR ZIRHLI KRUVAZÖR) ---
      ctx.fillStyle = 'rgba(25, 16, 4, 0.95)';
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(16, -16);
      ctx.lineTo(-14, -26);
      ctx.lineTo(-24, -14);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-24, 14);
      ctx.lineTo(-14, 26);
      ctx.lineTo(16, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Zırh plakaları
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(-8, -12, 16, 24);

      // Kokpit
      ctx.fillStyle = '#ffee55';
      ctx.fillRect(8, -4, 10, 8);

      // 4'lü Ağır Egzoz Alevi
      if (isThrusting) {
        ctx.fillStyle = '#ff5500';
        [-16, -7, 7, 16].forEach((yPos) => {
          ctx.beginPath();
          ctx.arc(-26, yPos, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    } else if (this.shipType === 'PHANTOM') {
      // --- GEMİ 3: PHANTOM (TERS KANATLI STEALTH KORVET) ---
      ctx.fillStyle = 'rgba(18, 4, 30, 0.95)';
      ctx.strokeStyle = '#d070ff';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(6, -6);
      ctx.lineTo(16, -26); // İleri açılı ters kanat
      ctx.lineTo(-6, -18);
      ctx.lineTo(-24, -6);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-24, 6);
      ctx.lineTo(-6, 18);
      ctx.lineTo(16, 26);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Plazma Hatları
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(12, -20);
      ctx.moveTo(22, 0);
      ctx.lineTo(12, 20);
      ctx.stroke();

      // Mor Alev
      if (isThrusting) {
        ctx.fillStyle = '#d070ff';
        const flame = Math.random() * 14 + 18;
        ctx.beginPath();
        ctx.moveTo(-20, -5); ctx.lineTo(-20 - flame, 0); ctx.lineTo(-20, 5);
        ctx.fill();
      }
    } else if (this.shipType === 'PHOENIX') {
      // --- GEMİ 4: PHOENIX (KATAMARAN ÇİFT GÖVDE) ---
      ctx.fillStyle = 'rgba(4, 25, 20, 0.95)';
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2.5;

      // Çift burun ve gövde
      ctx.beginPath();
      ctx.moveTo(28, -12); ctx.lineTo(-18, -18); ctx.lineTo(-22, -6); ctx.lineTo(-12, 0);
      ctx.lineTo(-22, 6); ctx.lineTo(-18, 18); ctx.lineTo(28, 12); ctx.lineTo(10, 6);
      ctx.lineTo(10, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Orta Enerji Çekirdeği
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // İkiz Yeşil İtici
      if (isThrusting) {
        ctx.fillStyle = '#00ff88';
        [-12, 12].forEach((yPos) => {
          ctx.beginPath();
          ctx.moveTo(-20, yPos - 3); ctx.lineTo(-36, yPos); ctx.lineTo(-20, yPos + 3);
          ctx.fill();
        });
      }
    } else {
      // --- GEMİ 1: VIPER (VARSAYILAN DELTA ÖNLEME AVCISI) ---
      ctx.fillStyle = 'rgba(2, 6, 16, 0.9)';
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(-18, 22);
      ctx.lineTo(-10, 8);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-18, -22);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(10, 22, 45, 0.95)';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -20);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-18, 0);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-14, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const glassGrad = ctx.createLinearGradient(16, 0, -2, 0);
      glassGrad.addColorStop(0, '#00ffcc');
      glassGrad.addColorStop(0.5, '#0088ff');
      glassGrad.addColorStop(1, '#051830');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(6, -3.5);
      ctx.lineTo(-2, -2.5);
      ctx.lineTo(-2, 2.5);
      ctx.lineTo(6, 3.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#00aaff';
      ctx.fillRect(-19, -7, 4, 3.5);
      ctx.fillRect(-19, 3.5, 4, 3.5);

      if (isThrusting) {
        const flameLen = Math.random() * 16 + 18;
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.moveTo(-19, -7); ctx.lineTo(-19 - flameLen, -5.25); ctx.lineTo(-19, -3.5);
        ctx.moveTo(-19, 3.5); ctx.lineTo(-19 - flameLen, 5.25); ctx.lineTo(-19, 7);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// --- 9. ANA OYUN YÖNETİCİSİ (GAME ENGINE) ---
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.radarCanvas = document.getElementById('radarCanvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;
    this.audio = new AudioEngine();

    this.selectedShip = 'VIPER';
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.mines = [];
    this.particles = [];
    this.shockwaves = [];

    // Taşıyıcı Savaş Gemisi & Warp Portalı Sistemi
    this.portal = null;
    this.warpState = 'NONE'; // 'NONE', 'WARPING'
    this.warpTimer = 0;
    this.warpFlash = 0;
    this.warpStreaks = [];
    this.nebulaSeeds = [
      { x: -900, y: -700, r: 750 },
      { x: 1300, y: 850, r: 800 },
      { x: -600, y: 1200, r: 650 },
      { x: 950, y: -950, r: 720 }
    ];

    this.camera = { x: 0, y: 0 };
    this.screenMouseX = window.innerWidth / 2;
    this.screenMouseY = window.innerHeight / 2;

    this.isFiring = false;
    this.isThrusting = false;

    // Mobil Sanal Joystick ve Dokunmatik Yönlendirme
    this.joystick = {
      active: false,
      touchId: null,
      baseX: 0,
      baseY: 0,
      curX: 0,
      curY: 0,
      radius: 56
    };
    this.mobileAimAngle = -Math.PI / 2;
    this.hasMobileAim = false;

    // 40 Seviye Durumu
    this.currentLevel = 1;
    this.maxLevels = 40;
    this.levelGoal = 12;
    this.levelKills = 0;
    this.levelScore = 0;
    this.totalScore = 0;
    this.totalKills = 0;
    this.elapsedTime = 0;

    this.spawnTimer = 0;

    this.isRunning = false;
    this.isPaused = false;
    this.isLevelPaused = false;
    this.lastTime = 0;
    this.animFrameId = null;

    this.dom = {
      levelDisplay: document.getElementById('level-display'),
      scoreDisplay: document.getElementById('score-display'),
      timeDisplay: document.getElementById('time-display'),
      objectiveText: document.getElementById('objective-text'),
      objectiveFill: document.getElementById('objective-fill'),
      shieldText: document.getElementById('shield-text'),
      shieldFill: document.getElementById('shield-fill'),
      hpText: document.getElementById('hp-text'),
      hpFill: document.getElementById('hp-fill'),
      mineName: document.getElementById('mine-name'),
      mineAmmo: document.getElementById('mine-ammo'),
      minePanel: document.getElementById('mine-panel'),
      ammoSlots: [
        null,
        document.getElementById('ammo-1'),
        document.getElementById('ammo-2'),
        document.getElementById('ammo-3'),
        document.getElementById('ammo-4'),
        document.getElementById('ammo-5'),
        document.getElementById('ammo-6')
      ],
      weaponSlots: document.querySelectorAll('.weapon-slot'),
      shipCards: document.querySelectorAll('.ship-card'),
      startOverlay: document.getElementById('start-overlay'),
      pauseOverlay: document.getElementById('pause-overlay'),
      pauseLevel: document.getElementById('pause-level'),
      pauseScore: document.getElementById('pause-score'),
      pauseMines: document.getElementById('pause-mines'),
      resumeBtn: document.getElementById('resume-btn'),
      pauseRestartBtn: document.getElementById('pause-restart-btn'),
      levelCompleteOverlay: document.getElementById('level-complete-overlay'),
      lcTitle: document.getElementById('lc-title'),
      lcSubtitle: document.getElementById('lc-subtitle'),
      lcNextZone: document.getElementById('lc-next-zone'),
      lcLevelScore: document.getElementById('lc-level-score'),
      lcTotalScore: document.getElementById('lc-total-score'),
      lcKills: document.getElementById('lc-kills'),
      nextLevelBtn: document.getElementById('next-level-btn'),
      gameOverOverlay: document.getElementById('game-over-overlay'),
      finalScore: document.getElementById('final-score'),
      finalWave: document.getElementById('final-wave'),
      finalTime: document.getElementById('final-time'),
      finalKills: document.getElementById('final-kills'),
      startBtn: document.getElementById('start-btn'),
      restartBtn: document.getElementById('restart-btn'),
      pauseBtn: document.getElementById('pause-btn'),
      soundBtn: document.getElementById('sound-btn'),
      soundIcon: document.getElementById('sound-icon'),
      musicBtn: document.getElementById('music-btn'),
      musicIcon: document.getElementById('music-icon'),
      mobileFireBtn: document.getElementById('mobile-fire-btn'),
      mobileThrustBtn: document.getElementById('mobile-thrust-btn'),
      mobileMineBtn: document.getElementById('mobile-mine-btn'),
      mobileWeaponBtn: document.getElementById('mobile-weapon-btn'),
      banner: document.getElementById('banner-notification'),
      bannerTitle: document.getElementById('banner-title'),
      bannerDesc: document.getElementById('banner-desc')
    };

    this.setupEvents();
    this.handleResize();
  }

  getWeaponTier() {
    if (this.currentLevel >= 30) return 4;
    if (this.currentLevel >= 18) return 3;
    if (this.currentLevel >= 8) return 2;
    return 1;
  }

  handleResize() {
    const dpr = window.devicePixelRatio || 1;
    this.viewWidth = window.innerWidth;
    this.viewHeight = window.innerHeight;

    this.canvas.width = this.viewWidth * dpr;
    this.canvas.height = this.viewHeight * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    if (!this.player) {
      this.player = new Player(0, 0, this.selectedShip);
    }
  }

  togglePause() {
    if (!this.isRunning || this.isLevelPaused) return;

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      if (this.dom.pauseLevel) this.dom.pauseLevel.textContent = `Bölüm ${this.currentLevel} / ${this.maxLevels}`;
      if (this.dom.pauseScore) this.dom.pauseScore.textContent = this.totalScore;
      if (this.dom.pauseMines && this.player) this.dom.pauseMines.textContent = `x${this.player.mineAmmo}`;
      if (this.dom.pauseOverlay) this.dom.pauseOverlay.classList.remove('hidden');
    } else {
      if (this.dom.pauseOverlay) this.dom.pauseOverlay.classList.add('hidden');
      this.lastTime = performance.now();
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      this.screenMouseX = e.clientX;
      this.screenMouseY = e.clientY;
    });

    // HANGAR GEMİ SEÇİM TIKLAMALARI
    this.dom.shipCards.forEach((card) => {
      card.addEventListener('click', () => {
        this.dom.shipCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedShip = card.dataset.ship;
        if (this.player) {
          this.player.applyShipProfile(this.selectedShip);
          this.updateHUD();
        }
      });
    });

    // FARE TIKLAMALARI
    window.addEventListener('mousedown', (e) => {
      if (!this.isRunning || this.isPaused || this.isLevelPaused) return;

      if (e.button === 0) { // Sol Tık Seri Ateş
        this.isFiring = true;
        if (this.player) {
          this.player.tryShoot(0.2, this.bullets, this.particles, this.audio, true, this.getWeaponTier());
        }
      } else if (e.button === 2) { // Sağ Tık Alan Mayını Bırak
        e.preventDefault();
        if (this.player) {
          const dropped = this.player.dropMine(this.mines, this.audio);
          if (dropped) this.updateHUD();
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isFiring = false;
    });

    // KLAVYE KONTROLLERİ (1-7 SİLAHLAR)
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) {
        if (this.dom.startOverlay && !this.dom.startOverlay.classList.contains('hidden') && (e.code === 'Space' || e.code === 'Enter')) {
          this.audio.init();
          this.start();
          return;
        }
        if (this.dom.gameOverOverlay && !this.dom.gameOverOverlay.classList.contains('hidden') && (e.code === 'Space' || e.code === 'Enter')) {
          this.audio.init();
          this.start();
          return;
        }
      }

      if (this.isLevelPaused && (e.code === 'Space' || e.code === 'Enter')) {
        this.nextLevel();
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.togglePause();
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.isThrusting = true;
      }

      if (e.code === 'KeyQ' || e.code === 'KeyE') {
        if (this.player) {
          this.player.toggleMine();
          this.updateHUD();
        }
      }

      // 1-7 SİLAH KISAYOLLARI
      if (e.key >= '1' && e.key <= '7' && this.player) {
        const idx = parseInt(e.key) - 1;
        this.player.setWeaponIndex(idx);
        this.updateWeaponSlots();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.isThrusting = false;
      }
    });

    window.addEventListener('wheel', (e) => {
      if (!this.player || this.isPaused || this.isLevelPaused) return;
      if (e.deltaY > 0) {
        this.player.setWeaponIndex((this.player.weaponIndex + 1) % 7);
      } else {
        this.player.setWeaponIndex((this.player.weaponIndex + 6) % 7);
      }
      this.updateWeaponSlots();
    }, { passive: true });

    if (this.dom.minePanel) {
      this.dom.minePanel.addEventListener('click', () => {
        if (!this.player) return;
        this.player.toggleMine();
        this.updateHUD();
      });
    }

    this.dom.weaponSlots.forEach((slot) => {
      slot.addEventListener('click', () => {
        if (!this.player) return;
        const idx = parseInt(slot.dataset.index);
        this.player.setWeaponIndex(idx);
        this.updateWeaponSlots();
      });
    });

    // --- MOBİL DOKUNMATİK BUTONLAR & SİSTEMLER ---
    if (this.dom.mobileFireBtn) {
      this.dom.mobileFireBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.init();
        this.isFiring = true;
        if (this.player) this.player.tryShoot(0.2, this.bullets, this.particles, this.audio, true, this.getWeaponTier());
      });
      this.dom.mobileFireBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.isFiring = false; });
      this.dom.mobileFireBtn.addEventListener('touchcancel', () => { this.isFiring = false; });
    }

    if (this.dom.mobileThrustBtn) {
      this.dom.mobileThrustBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.init();
        this.isThrusting = true;
      });
      this.dom.mobileThrustBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.isThrusting = false; });
      this.dom.mobileThrustBtn.addEventListener('touchcancel', () => { this.isThrusting = false; });
    }

    if (this.dom.mobileWeaponBtn) {
      this.dom.mobileWeaponBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.init();
        if (!this.player) return;
        this.player.setWeaponIndex((this.player.weaponIndex + 1) % 7);
        this.updateWeaponSlots();
        this.audio.playPickup(false);
      });
    }

    if (this.dom.mobileMineBtn) {
      let mineTimer = null;
      this.dom.mobileMineBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.init();
        mineTimer = setTimeout(() => {
          if (this.player) {
            this.player.toggleMine();
            this.updateHUD();
            this.showBanner('MAYIN DEĞİŞTİRİLDİ', this.player.mineIndex === 0 ? 'Termonükleer Mayın' : 'EMP Şok Mayını');
          }
          mineTimer = null;
        }, 360);
      });

      this.dom.mobileMineBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (mineTimer) {
          clearTimeout(mineTimer);
          mineTimer = null;
          if (this.player) {
            const dropped = this.player.dropMine(this.mines, this.audio);
            if (dropped) this.updateHUD();
          }
        }
      });
    }

    // --- MOBİL SANAL JOYSTICK (SOL BAŞPARMAK) & DOKUNMATİK NİŞAN ---
    window.addEventListener('touchstart', (e) => {
      if (!this.isRunning || this.isPaused || this.isLevelPaused) return;
      this.audio.init();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;
        if (target && target.closest && (target.closest('.mobile-btn') || target.closest('.icon-btn') || target.closest('.weapon-slot') || target.closest('.mine-panel') || target.closest('.overlay-card'))) {
          continue;
        }

        // Ekranın sol %58'lik alanı sanal joystick'i başlatır
        if (touch.clientX < this.viewWidth * 0.58) {
          if (!this.joystick.active) {
            this.joystick.active = true;
            this.joystick.touchId = touch.identifier;
            this.joystick.baseX = touch.clientX;
            this.joystick.baseY = touch.clientY;
            this.joystick.curX = touch.clientX;
            this.joystick.curY = touch.clientY;
            this.hasMobileAim = true;
          }
        } else {
          // Sağ tarafa dokunulduğunda doğrudan o noktaya nişan alır
          this.screenMouseX = touch.clientX;
          this.screenMouseY = touch.clientY;
          this.hasMobileAim = false;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isRunning || this.isPaused || this.isLevelPaused) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (this.joystick.active && touch.identifier === this.joystick.touchId) {
          const dx = touch.clientX - this.joystick.baseX;
          const dy = touch.clientY - this.joystick.baseY;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            this.mobileAimAngle = Math.atan2(dy, dx);
            this.hasMobileAim = true;
          }

          const maxR = this.joystick.radius;
          if (dist > maxR) {
            this.joystick.curX = this.joystick.baseX + (dx / dist) * maxR;
            this.joystick.curY = this.joystick.baseY + (dy / dist) * maxR;
          } else {
            this.joystick.curX = touch.clientX;
            this.joystick.curY = touch.clientY;
          }
        } else if (touch.clientX >= this.viewWidth * 0.58) {
          const target = touch.target;
          if (!target || !target.closest || !target.closest('.mobile-btn')) {
            this.screenMouseX = touch.clientX;
            this.screenMouseY = touch.clientY;
            this.hasMobileAim = false;
          }
        }
      }
    }, { passive: false });

    const endTouchHandler = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (this.joystick.active && touch.identifier === this.joystick.touchId) {
          this.joystick.active = false;
          this.joystick.touchId = null;
        }
      }
    };

    window.addEventListener('touchend', endTouchHandler, { passive: false });
    window.addEventListener('touchcancel', endTouchHandler, { passive: false });

    if (this.dom.startBtn) {
      this.dom.startBtn.addEventListener('click', () => {
        this.audio.init();
        this.start();
      });
    }

    if (this.dom.restartBtn) {
      this.dom.restartBtn.addEventListener('click', () => {
        this.audio.init();
        this.start();
      });
    }

    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }

    if (this.dom.resumeBtn) {
      this.dom.resumeBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }

    if (this.dom.pauseRestartBtn) {
      this.dom.pauseRestartBtn.addEventListener('click', () => {
        this.isPaused = false;
        if (this.dom.pauseOverlay) this.dom.pauseOverlay.classList.add('hidden');
        this.start();
      });
    }

    if (this.dom.nextLevelBtn) {
      this.dom.nextLevelBtn.addEventListener('click', () => {
        this.nextLevel();
      });
    }

    if (this.dom.soundBtn) {
      this.dom.soundBtn.addEventListener('click', () => {
        this.audio.init();
        const on = this.audio.toggleSfx();
        if (this.dom.soundIcon) this.dom.soundIcon.textContent = on ? '🔊' : '🔇';
      });
    }

    if (this.dom.musicBtn) {
      this.dom.musicBtn.addEventListener('click', () => {
        this.audio.init();
        const on = this.audio.toggleMusic();
        if (this.dom.musicIcon) this.dom.musicIcon.textContent = on ? '🎵' : '🔇';
      });
    }
  }

  updateWeaponSlots() {
    const tier = this.getWeaponTier();
    const names = [
      ['PLAZMA', 'İKİLİ LAZER', 'FÜZE', 'SAÇMA', 'RAY SİLAHI', 'TESLA ARK', 'VORTEKS'],
      ['GATLING', 'DÖRTLÜ LAZER', 'İKİZ FÜZE', 'PENTAGON', 'HİPER RAY', 'İYON YILDIRIM', 'TEKİLLİK'],
      ['VULCAN', 'FOTON LAZER', 'KUANTUM FÜZE', 'NOVA SAÇMA', 'ANTİ-MADDE', 'ŞİMŞEK AĞI', 'KUANTUM ÇÖKÜŞ'],
      ['OMEGA FIRTINA', 'TAKYON AĞI', 'KIYAMET SÜRÜSÜ', 'SÜPERNOVA', 'NEBULA IŞINI', 'FIRTINA ZİNCİRİ', 'KARA DELİK']
    ][tier - 1] || ['PLAZMA', 'İKİLİ LAZER', 'FÜZE', 'SAÇMA', 'RAY SİLAHI', 'TESLA ARK', 'VORTEKS'];

    this.dom.weaponSlots.forEach((slot, idx) => {
      const nameEl = slot.querySelector('.slot-name');
      if (nameEl && names[idx]) {
        nameEl.textContent = names[idx];
      }
      if (this.player && this.player.weaponIndex === idx) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });
  }

  showBanner(title, desc) {
    if (!this.dom.banner) return;
    if (this.dom.bannerTitle) this.dom.bannerTitle.textContent = title;
    if (this.dom.bannerDesc) this.dom.bannerDesc.textContent = desc;
    this.dom.banner.classList.remove('hidden');
    setTimeout(() => {
      if (this.dom.banner) this.dom.banner.classList.add('hidden');
    }, 3600);
  }

  start() {
    if (this.dom.startOverlay) this.dom.startOverlay.classList.add('hidden');
    if (this.dom.gameOverOverlay) this.dom.gameOverOverlay.classList.add('hidden');
    if (this.dom.levelCompleteOverlay) this.dom.levelCompleteOverlay.classList.add('hidden');
    if (this.dom.pauseOverlay) this.dom.pauseOverlay.classList.add('hidden');

    this.currentLevel = 1;
    this.totalScore = 0;
    this.totalKills = 0;
    this.elapsedTime = 0;

    this.setupLevel(1);
    this.isRunning = true;
    this.isPaused = false;
    this.isLevelPaused = false;
    this.lastTime = performance.now();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupLevel(lvl) {
    this.currentLevel = lvl;
    this.levelGoal = 10 + lvl * 3;
    this.levelKills = 0;
    this.levelScore = 0;

    this.enemies = [];
    this.bullets = [];
    this.mines = [];
    this.pickups = [];
    this.shockwaves = [];
    this.spawnTimer = 0;

    // Sektör Taşıyıcı Gemi & Warp Durumu Sıfırlama
    this.portal = null;
    this.warpState = 'NONE';
    this.warpTimer = 0;
    this.warpFlash = 0;

    if (!this.player) {
      this.player = new Player(0, 0, this.selectedShip);
    } else {
      this.player.applyShipProfile(this.selectedShip);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
      this.player.shield = this.player.maxShield;
      this.player.mineAmmo = Math.min(15, this.player.mineAmmo + 4);
    }

    const tier = this.getWeaponTier();
    const theme = this.getSectorTheme(lvl);

    // Sektör Başlangıç Sabit İkmal İstasyonları (Kendi kendine doğmaz, haritada bekler)
    // 1. Can / Onarım Kiti (Sol geride)
    this.pickups.push(new SupplyPickup(this.player.x - 360, this.player.y - 180, 7, true, tier));
    
    // 2. Güncel Seviye Silahı (Sağ ileride)
    const primaryWep = ((lvl - 1) % 6) + 1;
    this.pickups.push(new SupplyPickup(this.player.x + 380, this.player.y + 200, primaryWep, true, tier));

    // 3. Taktik Alternatif Silah (Tesla veya Vorteks)
    const secondaryWep = ((lvl + 2) % 6) + 1;
    this.pickups.push(new SupplyPickup(this.player.x + 160, this.player.y - 520, secondaryWep, true, tier));

    // 4. İleri Düzey Seviyelerde Derin Uzay İstasyonları
    if (lvl >= 4) {
      this.pickups.push(new SupplyPickup(this.player.x - 560, this.player.y + 440, 5, true, tier)); // Tesla Ark Topu
      this.pickups.push(new SupplyPickup(this.player.x + 600, this.player.y - 420, 7, true, tier)); // İkinci Hak Kiti
    }
    if (lvl >= 10) {
      this.pickups.push(new SupplyPickup(this.player.x - 740, this.player.y - 620, 6, true, tier)); // Kuantum Vorteks
    }

    this.updateWeaponSlots();
    this.updateHUD();

    const prevTier = lvl > 1 ? (lvl - 1 >= 30 ? 4 : (lvl - 1 >= 18 ? 3 : (lvl - 1 >= 8 ? 2 : 1))) : 1;
    if (tier > prevTier) {
      const tierTitles = [
        '',
        '',
        'SİLAH TEKNOLOJİSİ EVRİLDİ: TIER 2!',
        'SİLAH TEKNOLOJİSİ EVRİLDİ: TIER 3 (KUANTUM)!',
        'NİHAİ EVRİM: NEBULA PROTOKOLÜ (TIER 4)!'
      ];
      const tierDescs = [
        '',
        '',
        'Gatling, Dörtlü Lazer, İkiz Füzeler ve İyon Yıldırımı Devrede!',
        'Vulcan Topu, Foton Ağı, Şimşek Ağı ve Kuantum Çöküşü Kuşanıldı!',
        'Omega Fırtınası, Takyon Lazerleri, Fırtına Zinciri ve Kara Delik Bombası Aktif!'
      ];
      this.showBanner(tierTitles[tier], tierDescs[tier]);
    } else {
      this.showBanner(`SEKTÖR ${lvl} / ${this.maxLevels}`, `Bölge: ${theme.name} • Hedef: ${this.levelGoal} Düşman`);
    }
  }

  // 5 FARKLI DİNAMİK SEKTÖR ATMOSFERİ VE NEBULA RENK TEMASI
  getSectorTheme(lvl) {
    if (lvl <= 7) {
      return {
        name: 'Kobalt Derin Uzay Kuşağı',
        zone: 1,
        bgGradient: ['#020614', '#040e28', '#010208'],
        nebulaColor1: 'rgba(0, 150, 255, 0.09)',
        nebulaColor2: 'rgba(0, 240, 255, 0.07)',
        starColor: '#a5f3fc',
        gridColor: 'rgba(0, 240, 255, 0.035)'
      };
    } else if (lvl <= 15) {
      return {
        name: 'Kızıl Plazma Nebulası',
        zone: 2,
        bgGradient: ['#160205', '#2c040d', '#080102'],
        nebulaColor1: 'rgba(255, 42, 42, 0.10)',
        nebulaColor2: 'rgba(255, 120, 0, 0.08)',
        starColor: '#fca5a5',
        gridColor: 'rgba(255, 60, 60, 0.04)'
      };
    } else if (lvl <= 23) {
      return {
        name: 'Zehirli Zümrüt Asit Kuşağı',
        zone: 3,
        bgGradient: ['#011409', '#032612', '#010804'],
        nebulaColor1: 'rgba(0, 255, 136, 0.09)',
        nebulaColor2: 'rgba(180, 255, 0, 0.07)',
        starColor: '#86efac',
        gridColor: 'rgba(0, 255, 136, 0.04)'
      };
    } else if (lvl <= 32) {
      return {
        name: 'Kuantum Mor Yarığı',
        zone: 4,
        bgGradient: ['#0e021a', '#1e0536', '#06010c'],
        nebulaColor1: 'rgba(181, 55, 242, 0.10)',
        nebulaColor2: 'rgba(230, 70, 255, 0.08)',
        starColor: '#d8b4fe',
        gridColor: 'rgba(181, 55, 242, 0.04)'
      };
    } else {
      return {
        name: 'Kıyamet Tekilliği (Kara Delik)',
        zone: 5,
        bgGradient: ['#140800', '#261202', '#040200'],
        nebulaColor1: 'rgba(255, 170, 0, 0.11)',
        nebulaColor2: 'rgba(255, 60, 0, 0.09)',
        starColor: '#fef08a',
        gridColor: 'rgba(255, 170, 0, 0.045)'
      };
    }
  }

  // HEDEF TAMAMLANDIĞINDA TAŞIYICI GEMİ VE WARP PORTALI BELİRİR
  openMothershipPortal() {
    if (this.portal) return;

    const spawnAngle = this.player ? this.player.angle : 0;
    const spawnDist = 440;
    const px = this.player ? this.player.x + Math.cos(spawnAngle) * spawnDist : 0;
    const py = this.player ? this.player.y + Math.sin(spawnAngle) * spawnDist : 0;

    this.portal = new MothershipGate(px, py);
    this.audio.playPortalOpen();
    this.showBanner('SEKTÖR TEMİZLENDİ!', 'Taşıyıcı Ana Gemi Geldi! İbreyi Takip Edin ve Portala Giriş Yapın.');
  }

  triggerLevelComplete() {
    this.isLevelPaused = true;
    this.isFiring = false;
    this.isThrusting = false;
    this.audio.playLevelComplete();

    const nextLvl = this.currentLevel + 1;
    const nextTheme = this.getSectorTheme(nextLvl);

    if (this.dom.lcTitle) this.dom.lcTitle.textContent = `SEKTÖR ${this.currentLevel} TEMİZLENDİ!`;
    if (this.dom.lcSubtitle) this.dom.lcSubtitle.textContent = 'Taşıyıcı ana gemiye dönüldü, hiperuzay sıçraması hazır';
    if (this.dom.lcLevelScore) this.dom.lcLevelScore.textContent = `+${this.levelScore}`;
    if (this.dom.lcTotalScore) this.dom.lcTotalScore.textContent = `${this.totalScore}`;
    if (this.dom.lcKills) this.dom.lcKills.textContent = `${this.levelKills} Düşman`;
    if (this.dom.lcNextZone) {
      this.dom.lcNextZone.textContent = `Sektör ${nextLvl}: ${nextTheme.name}`;
      this.dom.lcNextZone.style.color = nextTheme.starColor;
      this.dom.lcNextZone.style.textShadow = `0 0 10px ${nextTheme.starColor}`;
    }

    if (this.dom.levelCompleteOverlay) this.dom.levelCompleteOverlay.classList.remove('hidden');
  }

  nextLevel() {
    if (this.dom.levelCompleteOverlay) this.dom.levelCompleteOverlay.classList.add('hidden');
    this.isLevelPaused = false;
    this.isFiring = false;
    this.isThrusting = false;

    if (this.currentLevel >= this.maxLevels) {
      this.showBanner('KAMPANYA TAMAMLANDI!', 'Tüm 40 Sektör Başarıyla Kurtarıldı!');
      this.gameOver(true);
      return;
    }

    this.setupLevel(this.currentLevel + 1);
    this.lastTime = performance.now();
  }

  spawnEnemy() {
    if (!this.player || this.portal) return;
    const spawnDist = Math.max(this.viewWidth, this.viewHeight) * 0.75 + 120;
    const a = Math.random() * Math.PI * 2;
    const ex = this.player.x + Math.cos(a) * spawnDist;
    const ey = this.player.y + Math.sin(a) * spawnDist;

    const r = Math.random();
    const lvl = this.currentLevel;

    if (lvl >= 15 && r < 0.22) {
      this.enemies.push(new CosmicLeviathan(ex, ey));
    } else if (lvl >= 6 && r < 0.42) {
      this.enemies.push(new HeavyDreadnought(ex, ey));
    } else if (lvl >= 3 && r < 0.62) {
      this.enemies.push(new SniperSloop(ex, ey));
    } else if (r < 0.82) {
      this.enemies.push(new ShadowInterceptor(ex, ey));
    } else {
      this.enemies.push(new PlasmaMine(ex, ey));
    }
  }

  // --- DÜŞMAN ÖLDÜĞÜNDE DÜŞEN GANİMET SİSTEMİ (7 SİLAH + HAK) ---
  dropEnemyLoot(e) {
    const tier = this.getWeaponTier();
    if (e.type === 'SCOUT') {
      if (Math.random() < 0.32) {
        this.pickups.push(new SupplyPickup(e.x, e.y, Math.floor(Math.random() * 4) + 1, false, tier));
      } else if (Math.random() < 0.12) {
        this.pickups.push(new SupplyPickup(e.x, e.y, 7, false, tier));
      }
    } else if (e.type === 'HARVESTER') {
      // Dretnot kesinlikle HAK kiti ve Tesla/Füze/Ray silahı düşürür
      this.pickups.push(new SupplyPickup(e.x - 25, e.y, 7, false, tier));
      this.pickups.push(new SupplyPickup(e.x + 25, e.y, Math.floor(Math.random() * 6) + 1, false, tier));
    } else if (e.type === 'DEATH_WORM') {
      // Kozmik Solucan HAK kiti ve Vorteks/Ray silahı düşürür
      this.pickups.push(new SupplyPickup(e.x, e.y - 25, 7, false, tier));
      this.pickups.push(new SupplyPickup(e.x - 30, e.y + 20, 6, false, tier)); // Vorteks bombası
      this.pickups.push(new SupplyPickup(e.x + 30, e.y + 20, 4, false, tier)); // Ray silahı
    } else if (e.type === 'SNIPER') {
      if (Math.random() < 0.65) {
        this.pickups.push(new SupplyPickup(e.x, e.y, Math.random() < 0.5 ? 5 : 2, false, tier)); // Tesla veya Füze
      } else if (Math.random() < 0.25) {
        this.pickups.push(new SupplyPickup(e.x, e.y, 7, false, tier));
      }
    } else if (e.type === 'MINE') {
      if (Math.random() < 0.25) {
        this.pickups.push(new SupplyPickup(e.x, e.y, Math.floor(Math.random() * 6) + 1, false, tier));
      }
    }
  }

  // MAYIN ALAN HASARI VE KESİN PATLAMA
  detonateMine(mine) {
    this.shockwaves.push(new Shockwave(mine.x, mine.y, mine.aoeRadius, mine.color));

    if (mine.type === 0) {
      this.audio.playExplosion(true);
      this.createExplosion(mine.x, mine.y, '#ff4400', 40);
    } else {
      this.audio.playEMP();
      this.createExplosion(mine.x, mine.y, '#00d2ff', 35);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      let inRange = false;
      const directDist = Math.hypot(e.x - mine.x, e.y - mine.y);

      if (directDist <= mine.aoeRadius + e.radius) {
        inRange = true;
      } else if (e.type === 'DEATH_WORM') {
        for (const seg of e.segments) {
          if (Math.hypot(seg.x - mine.x, seg.y - mine.y) <= mine.aoeRadius + seg.radius) {
            inRange = true;
            break;
          }
        }
      }

      if (inRange) {
        e.hp -= mine.damage;

        if (mine.type === 1) {
          e.speed *= 0.45;
        }

        if (e.hp <= 0 && !e.dead) {
          e.dead = true;
          this.levelKills++;
          this.totalKills++;

          let pts = 100;
          if (e.type === 'SCOUT') {
            pts = 100;
            this.createExplosion(e.x, e.y, e.color, 16);
          } else if (e.type === 'HARVESTER') {
            pts = 300;
            this.createExplosion(e.x, e.y, e.color, 36);
          } else if (e.type === 'DEATH_WORM') {
            pts = 800;
            this.createExplosion(e.x, e.y, e.color, 45);
          } else if (e.type === 'MINE') {
            pts = 80;
            this.createExplosion(e.x, e.y, '#ff2a2a', 20);
          } else if (e.type === 'SNIPER') {
            pts = 180;
            this.createExplosion(e.x, e.y, '#ff0033', 24);
          }

          this.levelScore += pts;
          this.totalScore += pts;
          this.dropEnemyLoot(e);
          this.enemies.splice(i, 1);

          if (this.levelKills >= this.levelGoal && !this.portal) {
            this.openMothershipPortal();
          }
        }
      }
    }
  }

  update(dt) {
    if (this.isPaused || this.isLevelPaused) return;

    this.elapsedTime += dt;

    // Hiperuzay Sıçrama Durumu (Mothership içine girildiğinde)
    if (this.warpState === 'WARPING') {
      this.warpTimer += dt;
      if (this.player && this.portal) {
        // Gemiyi Taşıyıcı Geminin hangar merkezine çek ve döndür
        this.player.x += (this.portal.x - this.player.x) * 0.14;
        this.player.y += (this.portal.y - this.player.y) * 0.14;
        this.player.angle += dt * 8;
        this.player.vx = 0;
        this.player.vy = 0;
      }

      this.camera.x = this.player.x - this.viewWidth / 2;
      this.camera.y = this.player.y - this.viewHeight / 2;

      // 1.4 saniye sonra level complete ekranını aç
      if (this.warpTimer > 1.4) {
        this.warpState = 'NONE';
        this.triggerLevelComplete();
        return;
      }
      return;
    }

    this.camera.x = this.player.x - this.viewWidth / 2;
    this.camera.y = this.player.y - this.viewHeight / 2;

    let targetAimAngle;
    if (this.hasMobileAim && this.joystick && this.joystick.active) {
      targetAimAngle = this.mobileAimAngle;
    } else {
      targetAimAngle = Math.atan2(
        this.screenMouseY - this.viewHeight / 2,
        this.screenMouseX - this.viewWidth / 2
      );
    }

    this.player.update(dt, targetAimAngle, this.isThrusting, this.particles);

    // Taşıyıcı Savaş Gemisi & Warp Portalı Kontrolü
    if (this.portal) {
      this.portal.update(dt, this.player);

      if (this.portal.docked && this.warpState === 'NONE') {
        this.warpState = 'WARPING';
        this.warpTimer = 0;
        this.warpFlash = 1.0;
        this.audio.playWarpJump();
        this.showBanner('DOCKING BAŞARILI!', 'Hiperuzay Atlama Motorları Devrede...');

        // Hiperuzay warp çizgilerini hazırla
        this.warpStreaks = [];
        for (let s = 0; s < 120; s++) {
          const a = Math.random() * Math.PI * 2;
          const dist = Math.random() * 450 + 50;
          this.warpStreaks.push({
            x: Math.cos(a) * dist,
            y: Math.sin(a) * dist,
            len: Math.random() * 70 + 30,
            speed: Math.random() * 800 + 500,
            angle: a,
            color: Math.random() < 0.5 ? '#00f0ff' : '#ffffff'
          });
        }
      }
    }

    if (this.isFiring) {
      this.player.tryShoot(dt, this.bullets, this.particles, this.audio, false, this.getWeaponTier());
    }

    // Düşman Doğurma
    this.spawnTimer += dt;
    const spawnRate = Math.max(0.42, 1.6 - (this.currentLevel * 0.03));
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // Mayın Kontrolleri
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.update(dt);

      if (m.life <= 0) {
        this.mines.splice(i, 1);
        continue;
      }

      if (m.isArmed()) {
        let trigger = false;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - m.x, e.y - m.y) < m.triggerRadius + e.radius) {
            trigger = true;
            break;
          }
          if (e.type === 'DEATH_WORM') {
            for (const seg of e.segments) {
              if (Math.hypot(seg.x - m.x, seg.y - m.y) < m.triggerRadius + seg.radius) {
                trigger = true;
                break;
              }
            }
            if (trigger) break;
          }
        }

        if (trigger) {
          this.detonateMine(m);
          this.mines.splice(i, 1);
          if (this.isLevelPaused) return;
        }
      }
    }

    // Şok Dalgaları
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.update(dt);
      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }

    // Mermiler ve Çarpışmalar
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(dt, this.enemies, this.particles);

      // Vorteks Bombası Süresi Bittiğinde Çöker
      if (b.type === 'VORTEX_BOMB' && b.life <= 0) {
        this.audio.playVortexImplosion();
        this.shockwaves.push(new Shockwave(b.x, b.y, b.aoeRadius, '#9d00ff'));
        this.createExplosion(b.x, b.y, '#9d00ff', 36);

        // Alandaki tüm düşmanlara devasa tekillik hasarı ver
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < b.aoeRadius) {
            e.hp -= b.damage;
            if (e.hp <= 0 && !e.dead) {
              e.dead = true;
              this.levelKills++;
              this.totalKills++;
              this.levelScore += 120;
              this.totalScore += 120;
              this.dropEnemyLoot(e);
              this.enemies.splice(j, 1);
              if (this.levelKills >= this.levelGoal && !this.portal) {
                this.openMothershipPortal();
              }
            }
          }
        }
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const isHit = e.type === 'DEATH_WORM'
          ? e.checkHit(b.x, b.y, b.radius)
          : Math.hypot(b.x - e.x, b.y - e.y) < e.radius + b.radius;

        if (isHit) {
          hit = true;
          e.hp -= b.damage;

          if (b.type === 'HOMING_MISSILE') {
            this.audio.playExplosion(true);
            this.createExplosion(b.x, b.y, '#00d2ff', 24);
            const aoe = b.aoeRadius || 140;
            for (const other of this.enemies) {
              if (other !== e && Math.hypot(b.x - other.x, b.y - other.y) < aoe) {
                other.hp -= b.damage * 0.6;
              }
            }
          } else if (b.type === 'TESLA_ARC') {
            // ZİNCİRLEME ŞİMŞEK: Yanındaki diğer düşmanlara elektrik arkı sıçratır!
            this.audio.playTeslaArcChain();
            this.createExplosion(b.x, b.y, '#00ffff', 12);
            let chained = 0;
            for (const other of this.enemies) {
              if (other !== e && !other.dead && chained < b.chainCount) {
                if (Math.hypot(e.x - other.x, e.y - other.y) < 230) {
                  other.hp -= b.damage * 0.75;
                  chained++;
                  // Görsel ark partikülü
                  this.createExplosion((e.x + other.x) / 2, (e.y + other.y) / 2, '#00ffff', 8);
                }
              }
            }
          } else if (b.type === 'VORTEX_BOMB') {
            // Çarptığında anında tekillik çöküşü başlat
            b.life = 0;
            break;
          } else {
            this.createExplosion(b.x, b.y, b.color, 4);
          }

          if (e.hp <= 0 && !e.dead) {
            e.dead = true;
            this.levelKills++;
            this.totalKills++;
            this.audio.playExplosion(e.type === 'DEATH_WORM' || e.type === 'HARVESTER');

            let pts = 100;
            if (e.type === 'SCOUT') {
              pts = 100;
              this.createExplosion(e.x, e.y, e.color, 16);
            } else if (e.type === 'HARVESTER') {
              pts = 300;
              this.createExplosion(e.x, e.y, e.color, 36);
            } else if (e.type === 'DEATH_WORM') {
              pts = 800;
              this.createExplosion(e.x, e.y, e.color, 45);
            } else if (e.type === 'MINE') {
              pts = 80;
              this.createExplosion(e.x, e.y, '#ff2a2a', 20);
            } else if (e.type === 'SNIPER') {
              pts = 180;
              this.createExplosion(e.x, e.y, '#ff0033', 24);
            }

            this.levelScore += pts;
            this.totalScore += pts;
            this.dropEnemyLoot(e);
            this.enemies.splice(j, 1);

            if (this.levelKills >= this.levelGoal && !this.portal) {
              this.openMothershipPortal();
            }
          }

          b.pierce--;
          if (b.pierce <= 0) break;
        }
      }

      if (hit && b.pierce <= 0 && b.type !== 'VORTEX_BOMB') {
        this.bullets.splice(i, 1);
      }
    }

    // Düşmanlar - Oyuncu Çarpışması
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(this.player, dt);

      const collides = e.type === 'DEATH_WORM'
        ? e.checkHit(this.player.x, this.player.y, this.player.radius)
        : Math.hypot(e.x - this.player.x, e.y - this.player.y) < e.radius + this.player.radius;

      if (collides) {
        const dmg = e.type === 'MINE' ? 35 : (e.type === 'DEATH_WORM' ? 26 : 16);
        const died = this.player.takeDamage(dmg, this.audio);

        const bumpAngle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
        e.x += Math.cos(bumpAngle) * 40;
        e.y += Math.sin(bumpAngle) * 40;

        if (e.type === 'MINE') {
          this.createExplosion(e.x, e.y, '#ff2a2a', 24);
          this.audio.playExplosion(true);
          this.enemies.splice(i, 1);
        }

        if (died) {
          this.gameOver();
          return;
        }
      }
    }

    // İkmal Kapsüllerinin Toplanması & Manyetik Çekim
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.update(this.player, dt, this.particles);

      if (pk.life <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(pk.x - this.player.x, pk.y - this.player.y);
      if (dist < pk.radius + this.player.radius + 25) {
        if (pk.typeIndex === 7) {
          // HAK / CAN ONARIM KİTİ
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
          this.player.shield = this.player.maxShield;
          this.player.mineAmmo = Math.min(15, this.player.mineAmmo + 2);
          this.audio.playPickup(true);
          this.createExplosion(pk.x, pk.y, '#00ffaa', 24);
          this.showBanner('GEMİ ONARILDI!', '+40 Gövde, Kalkan Şarjı, +2 Mayın');
        } else {
          // 7 SİLAHTAN BİRİ
          const ammoBoosts = [0, 90, 20, 60, 12, 45, 8];
          this.player.ammo[pk.typeIndex] += ammoBoosts[pk.typeIndex] || 25;
          this.player.setWeaponIndex(pk.typeIndex);
          this.updateWeaponSlots();
          this.audio.playPickup(false);
          this.createExplosion(pk.x, pk.y, pk.color, 20);
          this.showBanner(`${pk.name} KUŞANILDI!`, 'Cephane ve sistemler hazır.');
        }

        this.pickups.splice(i, 1);
      }
    }

    // Partiküller
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.updateHUD();
    this.drawRadar();
  }

  createExplosion(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 220 + 60;
      this.particles.push(new Particle(
        x,
        y,
        color,
        Math.random() * 3.5 + 2,
        speed,
        angle,
        Math.random() * 0.4 + 0.3
      ));
    }
  }

  updateHUD() {
    if (!this.player) return;

    if (this.dom.levelDisplay) this.dom.levelDisplay.textContent = `${this.currentLevel} / ${this.maxLevels}`;
    if (this.dom.scoreDisplay) this.dom.scoreDisplay.textContent = this.totalScore;

    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    if (this.dom.timeDisplay) {
      this.dom.timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (this.dom.objectiveText) {
      this.dom.objectiveText.textContent = `${this.levelKills} / ${this.levelGoal} DÜŞMAN`;
    }
    const objPct = Math.min(100, (this.levelKills / this.levelGoal) * 100);
    if (this.dom.objectiveFill) this.dom.objectiveFill.style.width = `${objPct}%`;

    const shieldPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
    if (this.dom.shieldFill) this.dom.shieldFill.style.width = `${shieldPct}%`;
    if (this.dom.shieldText) this.dom.shieldText.textContent = `${Math.ceil(this.player.shield)} / ${this.player.maxShield}`;

    const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
    if (this.dom.hpFill) this.dom.hpFill.style.width = `${hpPct}%`;
    if (this.dom.hpText) this.dom.hpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    const mineNames = ['TERMONÜKLEER MAYIN', 'EMP ŞOK MAYINI'];
    if (this.dom.mineName) this.dom.mineName.textContent = mineNames[this.player.mineIndex];
    if (this.dom.mineAmmo) this.dom.mineAmmo.textContent = `x${this.player.mineAmmo}`;

    for (let i = 1; i <= 6; i++) {
      if (this.dom.ammoSlots[i]) {
        this.dom.ammoSlots[i].textContent = this.player.ammo[i];
      }
    }
  }

  // --- SEKTÖR RADARI ---
  drawRadar() {
    if (!this.radarCtx || !this.radarCanvas || !this.player) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#010206';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    const radarRange = 2600;
    const scale = (w / 2) / radarRange;

    // Mayınlar
    ctx.fillStyle = '#ff8800';
    for (const m of this.mines) {
      const rx = (m.x - this.player.x) * scale + w / 2;
      const ry = (m.y - this.player.y) * scale + h / 2;
      if (rx >= 0 && rx <= w && ry >= 0 && ry <= h) {
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      }
    }

    // Kapsüller (Yeşil = Hak/Can, Mavi/Sarı = Silah)
    for (const p of this.pickups) {
      const rx = (p.x - this.player.x) * scale + w / 2;
      const ry = (p.y - this.player.y) * scale + h / 2;
      if (rx >= 0 && rx <= w && ry >= 0 && ry <= h) {
        ctx.fillStyle = p.typeIndex === 7 ? '#00ffaa' : '#00f0ff';
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      }
    }

    // Düşmanlar
    for (const e of this.enemies) {
      const rx = (e.x - this.player.x) * scale + w / 2;
      const ry = (e.y - this.player.y) * scale + h / 2;
      if (rx >= 0 && rx <= w && ry >= 0 && ry <= h) {
        let col = '#ff0055';
        if (e.type === 'DEATH_WORM') col = '#9d00ff';
        else if (e.type === 'HARVESTER') col = '#ffaa00';
        else if (e.type === 'MINE') col = '#ff2a2a';
        else if (e.type === 'SNIPER') col = '#ff0033';
        ctx.fillStyle = col;
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      }
    }

    // Taşıyıcı Savaş Gemisi Portalı (Radar üzerinde parlayan altın/mavi hedef)
    if (this.portal) {
      const rx = (this.portal.x - this.player.x) * scale + w / 2;
      const ry = (this.portal.y - this.player.y) * scale + h / 2;
      const clampedRx = Math.max(8, Math.min(w - 8, rx));
      const clampedRy = Math.max(8, Math.min(h - 8, ry));

      ctx.save();
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(clampedRx, clampedRy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Nabız Halkası
      const pR = 5 + ((Date.now() % 1000) / 1000) * 8;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(clampedRx, clampedRy, pR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Oyuncu (Seçilen gemi renginde parlar)
    ctx.fillStyle = this.player.color || '#00f0ff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.player.color || '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2 + Math.cos(this.player.angle) * 9, h / 2 + Math.sin(this.player.angle) * 9);
    ctx.stroke();
  }

  // PARALLAKS NEBULA BULUTLARI (5 DİNAMİK BÖLGE TEMASINA GÖRE)
  drawNebulaClouds(theme) {
    this.ctx.save();
    const px = -this.camera.x * 0.16;
    const py = -this.camera.y * 0.16;
    this.ctx.translate(px, py);

    for (let i = 0; i < this.nebulaSeeds.length; i++) {
      const seed = this.nebulaSeeds[i];
      const gx = seed.x + this.viewWidth / 2;
      const gy = seed.y + this.viewHeight / 2;
      const grad = this.ctx.createRadialGradient(gx, gy, 40, gx, gy, seed.r);
      const col = (i % 2 === 0) ? theme.nebulaColor1 : theme.nebulaColor2;
      grad.addColorStop(0, col);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, seed.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // TAŞIYICI SAVAŞ GEMİSİ HEDEF GÖSTERGE OKU VE MESAFE SAYACI
  drawPortalBeacon(ctx) {
    if (!this.portal || !this.player || this.portal.docked) return;

    const dx = this.portal.x - this.player.x;
    const dy = this.portal.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    const centerX = this.viewWidth / 2;
    const centerY = this.viewHeight / 2;
    const angle = Math.atan2(dy, dx);

    const screenX = this.portal.x - this.camera.x;
    const screenY = this.portal.y - this.camera.y;

    const margin = 80;
    const isOffScreen = screenX < margin || screenX > this.viewWidth - margin ||
                        screenY < margin || screenY > this.viewHeight - margin;

    ctx.save();
    if (isOffScreen) {
      // Ekran kenarına ibre/ok sabitleme
      const clampX = Math.max(margin, Math.min(this.viewWidth - margin, centerX + Math.cos(angle) * (this.viewWidth / 2 - margin)));
      const clampY = Math.max(margin, Math.min(this.viewHeight - margin, centerY + Math.sin(angle) * (this.viewHeight / 2 - margin)));

      ctx.translate(clampX, clampY);
      ctx.rotate(angle);

      // Neon üçgen ibre
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(-14, -13);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-14, 13);
      ctx.closePath();
      ctx.fill();

      // Mesafe Bilgisi
      ctx.rotate(-angle);
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillText(`${Math.round(dist)}m`, 0, -22);
      ctx.font = 'bold 9px Rajdhani, sans-serif';
      ctx.fillStyle = '#00ffaa';
      ctx.fillText('PORTAL', 0, 26);
    } else {
      // Ekranda görünürken portal üstünde iniş kılavuzu
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.fillStyle = '#00ffaa';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00ffaa';
      ctx.fillText(`▼ DOCKING HEDEFİ (${Math.round(dist)}m)`, screenX, screenY - 140);
    }
    ctx.restore();
  }

  // HİPERUZAY WARP GEÇİŞ EFEKTİ (STAR STREAKS & FLASH)
  drawWarpEffect(ctx) {
    if (this.warpState !== 'WARPING') return;

    ctx.save();
    const cx = this.viewWidth / 2;
    const cy = this.viewHeight / 2;

    // Hiperuzay Hız Çizgileri
    ctx.lineWidth = 2.5;
    for (const st of this.warpStreaks) {
      st.speed += 40;
      const curDist = Math.hypot(st.x, st.y);
      const nx = st.x + Math.cos(st.angle) * st.speed * 0.016;
      const ny = st.y + Math.sin(st.angle) * st.speed * 0.016;
      st.x = nx;
      st.y = ny;

      const tailX = cx + nx - Math.cos(st.angle) * (st.len + curDist * 0.35);
      const tailY = cy + ny - Math.sin(st.angle) * (st.len + curDist * 0.35);
      const headX = cx + nx;
      const headY = cy + ny;

      ctx.strokeStyle = st.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = st.color;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }

    // Beyaz / Mavi Flaş Efekti
    if (this.warpFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.92, this.warpFlash)})`;
      ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
      this.warpFlash -= 0.025;
    }
    ctx.restore();
  }

  draw() {
    const theme = this.getSectorTheme(this.currentLevel);

    // 1. Dinamik Kozmik Arka Plan Gradyanı
    const bgGrad = this.ctx.createRadialGradient(
      this.viewWidth / 2, this.viewHeight / 2, 60,
      this.viewWidth / 2, this.viewHeight / 2, Math.max(this.viewWidth, this.viewHeight) * 0.85
    );
    bgGrad.addColorStop(0, theme.bgGradient[1]);
    bgGrad.addColorStop(0.6, theme.bgGradient[0]);
    bgGrad.addColorStop(1, theme.bgGradient[2]);
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    // 2. Parallaks Nebula Gaz Bulutları
    this.drawNebulaClouds(theme);

    // 3. Yıldız Alanları (Temanın yıldız renginde)
    const drawInfiniteStars = (speed, count, size, alpha, color) => {
      this.ctx.save();
      const tileSize = 600;
      const offsetX = -(this.camera.x * speed) % tileSize;
      const offsetY = -(this.camera.y * speed) % tileSize;

      const cols = Math.ceil(this.viewWidth / tileSize) + 2;
      const rows = Math.ceil(this.viewHeight / tileSize) + 2;

      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = alpha;
      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const tileX = c * tileSize + offsetX;
          const tileY = r * tileSize + offsetY;

          for (let i = 0; i < count; i++) {
            const sx = tileX + ((i * 127 + 43) % tileSize);
            const sy = tileY + ((i * 283 + 97) % tileSize);
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, size, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }
      this.ctx.restore();
    };

    drawInfiniteStars(0.12, 14, 1.0, 0.45, theme.starColor);
    drawInfiniteStars(0.35, 10, 1.8, 0.70, '#ffffff');
    drawInfiniteStars(0.85, 6, 2.5, 0.95, theme.starColor);

    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 4. Dinamik Renkli Koordinat Izgarası
    const gridStep = 200;
    const startX = Math.floor(this.camera.x / gridStep) * gridStep;
    const endX = startX + this.viewWidth + gridStep * 2;
    const startY = Math.floor(this.camera.y / gridStep) * gridStep;
    const endY = startY + this.viewHeight + gridStep * 2;

    this.ctx.strokeStyle = theme.gridColor;
    this.ctx.lineWidth = 1;
    for (let x = startX; x <= endX; x += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }

    // Taşıyıcı Savaş Gemisi / Warp Portalı
    if (this.portal) {
      this.portal.draw(this.ctx);
    }

    // Şok Dalgaları
    for (const sw of this.shockwaves) sw.draw(this.ctx);

    // Mayınlar
    for (const m of this.mines) m.draw(this.ctx);

    // İkmal Kapsülleri (7 Silah + Hak)
    for (const p of this.pickups) p.draw(this.ctx);

    // Mermiler
    for (const b of this.bullets) b.draw(this.ctx);

    // Düşmanlar
    for (const e of this.enemies) e.draw(this.ctx);

    // Partiküller
    for (const pt of this.particles) pt.draw(this.ctx);

    // Oyuncu Gemisi (Seçilen Hangar Modeli)
    if (this.player) this.player.draw(this.ctx, this.isThrusting);

    this.ctx.restore();

    // 5. Ekran Sabit UI: Taşıyıcı Gemi Gösterge Oku & Mesafe İbresi
    this.drawPortalBeacon(this.ctx);

    // 6. Hiperuzay Sıçrama Çizgileri ve Parlama Efekti
    this.drawWarpEffect(this.ctx);

    // Mobil Sanal Joystick (Sol Başparmak)
    if (this.joystick && this.joystick.active) {
      this.drawVirtualJoystick(this.ctx);
    }
  }

  drawVirtualJoystick(ctx) {
    ctx.save();
    ctx.resetTransform?.();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    const bx = this.joystick.baseX;
    const by = this.joystick.baseY;
    const cx = this.joystick.curX;
    const cy = this.joystick.curY;
    const r = this.joystick.radius;

    // Dış Taban Halkası
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f0ff';
    ctx.stroke();

    // 4 Yön Çentiği
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    [-Math.PI / 2, 0, Math.PI / 2, Math.PI].forEach((ang) => {
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(ang) * (r - 6), by + Math.sin(ang) * (r - 6));
      ctx.lineTo(bx + Math.cos(ang) * (r + 6), by + Math.sin(ang) * (r + 6));
      ctx.stroke();
    });

    // Çekme Vektörü
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // İç Topuz (Knob)
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 22);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.95)');
    grad.addColorStop(1, 'rgba(0, 100, 200, 0.7)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    if (!this.isPaused && !this.isLevelPaused) {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.update(dt);
    }
    this.draw();
    this.lastTime = currentTime;

    this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  gameOver(victory = false) {
    this.isRunning = false;
    if (this.player) {
      this.createExplosion(this.player.x, this.player.y, '#00f0ff', 45);
      this.createExplosion(this.player.x, this.player.y, '#ff0055', 45);
    }
    this.audio.playExplosion(true);

    if (this.dom.finalScore) this.dom.finalScore.textContent = this.totalScore;
    if (this.dom.finalWave) this.dom.finalWave.textContent = `Bölüm ${this.currentLevel} / ${this.maxLevels}`;
    if (this.dom.finalTime && this.dom.timeDisplay) this.dom.finalTime.textContent = this.dom.timeDisplay.textContent;
    if (this.dom.finalKills) this.dom.finalKills.textContent = this.totalKills;

    setTimeout(() => {
      if (this.dom.gameOverOverlay) this.dom.gameOverOverlay.classList.remove('hidden');
    }, 600);
  }
}

// Oyunu Sayfa Yüklendiğinde Başlat
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
