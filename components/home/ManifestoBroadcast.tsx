'use client';

import { useEffect, useRef } from 'react';

// Hijacked-broadcast manifesto: archive footage hard-cut against the brand's slogan cards,
// signal dies, then the manifesto plays over the brand's own photos as red-bar captions.
// Canvas-drawn; the full text is mirrored in an sr-only list.

const SPEED = 0.6; // global pacing multiplier — lower is faster

type Shot = {
  type: 'arc' | 'card' | 'photo' | 'flash' | 'static' | 'end';
  src: string | null; // relative to /images/brand/ unless it contains a folder
  ms: number;
  a?: string; b?: string; // caption lines (photo)
  z?: number; ox?: number; oy?: number; // crop: zoom + focal point, lets one frame yield several cuts
};

const arc = (src: string, ms: number, z = 1, ox = 0.5, oy = 0.5): Shot => ({ type: 'arc', src, ms, z, ox, oy });
const card = (src: string, ms: number): Shot => ({ type: 'card', src, ms });
const flash = (src: string, ms: number, z = 1, ox = 0.5, oy = 0.5): Shot => ({ type: 'flash', src, ms, z, ox, oy });
const photo = (src: string, a: string, b: string): Shot => ({ type: 'photo', src, ms: 3000, a, b });

const SHOTS: Shot[] = [
  arc('frame-cbs-1970.jpg', 1100), card('slogan-lied-to.webp', 900),
  arc('frame-nam-01.jpg', 700), card('slogan-packaged.webp', 620),
  arc('frame-zapruder.jpg', 600), arc('frame-zapruder.jpg', 260, 1.9, 0.35, 0.55), card('slogan-researched.webp', 580),
  arc('frame-cctv.jpg', 480), arc('frame-cctv.jpg', 220, 2.2, 0.6, 0.6), card('slogan-used-against-you.webp', 600),
  arc('frame-tunisia-02.jpg', 400), card('head.webp', 300), card('slogan-manipulated.webp', 420),
  arc('frame-nam-02.jpg', 320), arc('frame-nam-02.jpg', 180, 2, 0.45, 0.4), card('slogan-marketed.webp', 340),
  arc('frame-moon.jpg', 260), card('slogan-designed.webp', 260),
  arc('frame-tunisia-01.jpg', 220),
  // burst — punch-in crops, almost subliminal
  arc('frame-cbs-1970.jpg', 120, 2.4, 0.3, 0.45), arc('frame-nam-01.jpg', 110, 2.2, 0.6, 0.5),
  arc('frame-zapruder.jpg', 100, 2.6, 0.55, 0.5), card('sigil-red.webp', 90),
  arc('frame-cctv.jpg', 100, 3, 0.4, 0.7), arc('frame-tunisia-02.jpg', 90, 2.4, 0.5, 0.6),
  arc('frame-moon.jpg', 90, 2.4, 0.5, 0.4), card('head.webp', 90),
  card('slogan-movements-sold.webp', 950),
  card('slogan-not-televised.webp', 1600),
  { type: 'static', src: null, ms: 900 },
  card('slogan-old-world.webp', 1600),
  card('slogan-new-world.webp', 1400),
  photo('photo-night-fire-1.webp', 'For the dreamers', 'of yesterday'),
  flash('events/beatretreat_01.webp', 260), flash('photo-camo-hat.webp', 220),
  photo('photo-street-sign.webp', 'For the visionaries', 'of tomorrow'),
  flash('photo-jacket-rack.webp', 240), flash('events/colonel_reef_01.webp', 220),
  photo('photo-night-fire-2.webp', 'For those who dare', 'to do different'),
  flash('photo-bags.webp', 240), flash('photo-night-fire-1.webp', 200, 2, 0.5, 0.3),
  photo('photo-popup-rack.webp', 'For the misfits who turn', 'chaos into beauty'),
  flash('events/maddina_market_01.webp', 260), flash('photo-tee-back.webp', 220),
  photo('photo-tee-beach.webp', 'For the rockstars born', 'in the wrong century'),
  flash('photo-street-sign.webp', 220, 1.8, 0.5, 0.35), flash('photo-camo-hat.webp', 200, 1.8),
  photo('photo-showroom-rack.webp', 'For the rebel minds,', 'defiant & untamed'),
  card('sigil-square.webp', 600),
  { type: 'end', src: 'wordmark-paris-bey.webp', ms: 3200 },
  { type: 'static', src: null, ms: 420 },
];

const TEXT = [
  'You were lied to. Packaged. Researched, and used against you.',
  'The revolution will not be televised.',
  'The old world is dying, and the new world struggles to be born.',
  'For the dreamers of yesterday',
  'For the visionaries of tomorrow',
  'For those who dare to do different',
  'For the misfits who turn chaos into beauty',
  'For the rockstars born in the wrong century',
  'For the rebel minds, defiant and untamed',
  'Welcome to the revolution',
];

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, Math.floor(((ms % 1000) / 1000) * 30)].map(pad).join(':');
};

export default function ManifestoBroadcast() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const chRef = useRef<HTMLSpanElement>(null);
  const curRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const cv = canvasRef.current!;
    const cx = cv.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, raf = 0;

    const imgs: Record<string, HTMLImageElement> = {};
    for (const { src } of SHOTS) {
      if (src && !imgs[src]) {
        const img = new Image();
        img.src = src.includes('/') ? `/images/${src}` : `/images/brand/${src}`;
        imgs[src] = img;
      }
    }

    const size = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const grain = Array.from({ length: 4 }, () => {
      const c = document.createElement('canvas');
      c.width = c.height = 220;
      const g = c.getContext('2d')!, d = g.createImageData(220, 220);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
      return c;
    });
    const tearBuf = document.createElement('canvas');

    const cover = (img: HTMLImageElement, zoom = 1, ox = 0.5, oy = 0.5) => {
      const r = Math.max(W / img.width, H / img.height) * zoom, w = img.width * r, h = img.height * r;
      cx.drawImage(img, (W - w) * ox, (H - h) * oy, w, h);
    };
    const noise = (a: number, mode: GlobalCompositeOperation = 'overlay') => {
      cx.save();
      cx.globalAlpha = a; cx.globalCompositeOperation = mode;
      cx.fillStyle = cx.createPattern(grain[(Math.random() * 4) | 0], 'repeat')!;
      cx.translate(Math.random() * 220, Math.random() * 220);
      cx.fillRect(-220, -220, W + 440, H + 440);
      cx.restore();
    };
    // horizontal slices shoved sideways — the damage on every cut
    const tear = (n: number, amp: number) => {
      tearBuf.width = cv.width; tearBuf.height = cv.height;
      tearBuf.getContext('2d')!.drawImage(cv, 0, 0);
      for (let i = 0; i < n; i++) {
        const y = Math.random() * H, h = 4 + Math.random() * H * 0.08;
        cx.drawImage(tearBuf, 0, y * dpr, cv.width, h * dpr, (Math.random() - 0.5) * amp, y, W, h);
      }
    };
    // Kruger caption: small line, then the punchline on a red bar that wipes in
    const caption = (a: string, b: string, t: number) => {
      const big = Math.min(W * 0.075, H * 0.13), small = big * 0.5, x = W * 0.07, y = H * 0.62;
      cx.textBaseline = 'alphabetic';
      cx.globalAlpha = Math.min(1, t / 300);
      cx.font = `${small}px "Dirty War"`; cx.fillStyle = '#ece7da';
      cx.fillText(a, x, y - big * 0.82 - small * 0.45);
      cx.globalAlpha = 1;
      cx.font = `${big}px "Dirty War"`;
      const w = cx.measureText(b).width, p = big * 0.22;
      const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 250 * SPEED) / (380 * SPEED))), 3);
      cx.fillStyle = '#8f0f0a'; cx.fillRect(x - p, y - big * 0.82, (w + p * 2) * e, big * 1.08);
      cx.save(); cx.beginPath(); cx.rect(x - p, y - big, (w + p * 2) * e, big * 1.4); cx.clip();
      cx.fillStyle = '#ece7da'; cx.fillText(b, x, y); cx.restore();
    };

    let idx = 0, el = 0, last = 0, visible = false, hover = false, clock = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 });
    io.observe(root);
    const onEnter = () => { hover = true; root.dataset.paused = 'true'; };
    const onLeave = () => { hover = false; delete root.dataset.paused; };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect(), c = curRef.current!;
      c.style.left = `${e.clientX - r.left}px`; c.style.top = `${e.clientY - r.top}px`;
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointermove', onMove);

    const frame = (t: number) => {
      const dt = Math.min(80, t - (last || t)); last = t;
      const run = visible && !hover && !document.hidden;
      if (run) { el += dt; clock += dt; }
      // reduced motion: same sequence, slow and without tearing/shake
      // reduced motion skips the sub-second flashes entirely
      while (reduced && SHOTS[idx].ms < 300) idx = (idx + 1) % SHOTS.length;
      const dur = SHOTS[idx].ms * (reduced ? 3 : SPEED);
      if (el > dur) { el = 0; idx = (idx + 1) % SHOTS.length; }
      const { type, src, a, b, z = 1, ox = 0.5, oy = 0.5 } = SHOTS[idx];
      const img = src ? imgs[src] : null, p = el / dur, ready = !!img?.complete && img.naturalWidth > 0;

      cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1; cx.filter = 'none';
      cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
      cx.save();
      if (hover && !reduced) cx.translate(0, (Math.random() - 0.5) * 3);
      if (type === 'arc' && ready) {
        cx.filter = 'grayscale(1) contrast(1.45) brightness(.85)'; cover(img!, z * (1.04 + p * 0.05), ox, oy); cx.filter = 'none'; noise(0.22);
      } else if (type === 'flash' && ready) {
        cx.filter = 'contrast(1.25) saturate(1.2) brightness(.7)'; cover(img!, z * (1.06 + p * 0.06), ox, oy); cx.filter = 'none'; noise(0.18);
      } else if (type === 'card' && ready) {
        cover(img!, 1 + 0.035 * Math.max(0, 1 - el / 160)); noise(0.12);
      } else if (type === 'end' && ready) {
        cover(img!, 1); noise(0.12);
        cx.font = `${Math.min(W * 0.016, 20)}px "Retro Computer"`; cx.fillStyle = '#120302'; cx.textAlign = 'center';
        cx.globalAlpha = Math.min(1, Math.max(0, (el - 500 * SPEED) / 400));
        cx.fillText('WELCOME TO THE REVOLUTION', W / 2, H * 0.8);
        cx.textAlign = 'left'; cx.globalAlpha = 1;
      } else if (type === 'photo' && ready) {
        cx.filter = 'contrast(1.15) saturate(1.15) brightness(.62)'; cover(img!, 1.12 - p * 0.08, 0.5, 0.35 + p * 0.2); cx.filter = 'none';
        noise(0.14); caption(a!, b!, el);
      } else if (type === 'static') {
        noise(1, 'source-over');
        cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(0, 0, W, H);
        cx.fillStyle = 'rgba(255,255,255,.12)'; cx.fillRect(0, (el * 0.9) % H, W, H * 0.12);
        cx.font = `${Math.min(W * 0.02, 24)}px "Retro Computer"`; cx.fillStyle = '#ece7da'; cx.textAlign = 'center';
        if (el % 400 < 260) cx.fillText('SIGNAL INTERRUPTED', W / 2, H / 2);
        cx.textAlign = 'left';
      }
      cx.restore();
      if (!reduced && run && el < 110) {
        tear(5 + ((Math.random() * 6) | 0), W * 0.12);
        if (el < 40) { cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fillRect(0, 0, W, H); }
      }
      // vhs tracking band — stronger while paused
      cx.globalAlpha = hover ? 0.5 : 0.18;
      cx.drawImage(grain[Math.floor(t / 50) % 4], 0, ((t * 0.05) % (H * 1.6)) - H * 0.3, W, hover ? 14 : 6);
      cx.globalAlpha = 1;

      tcRef.current!.textContent = `SP ${timecode(clock)}`;
      chRef.current!.textContent = type === 'arc' ? 'CH 04 · ARCHIVE' : type === 'photo' || type === 'flash' ? 'CH 00 · LIVE' : type === 'static' ? 'CH -- · NO SIGNAL' : 'CH 04';
      raf = requestAnimationFrame(frame);
    };

    let cancelled = false;
    Promise.all([document.fonts.load('60px "Dirty War"'), document.fonts.load('16px "Retro Computer"')]).then(() => {
      if (cancelled) return;
      size();
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener('resize', size);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', size);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <section className="lp-broadcast" aria-label="La Propagande manifesto">
      <ol className="sr-only">
        {TEXT.map((line) => <li key={line}>{line}</li>)}
      </ol>
      <div ref={rootRef} className="lp-broadcast__tv" aria-hidden="true">
        <canvas ref={canvasRef} className="lp-broadcast__canvas" />
        <div className="lp-broadcast__scan" />
        <div className="lp-broadcast__vig" />
        <div className="lp-broadcast__osd lp-broadcast__osd--tl">
          <span className="lp-broadcast__play">PLAY ▶</span>
          <span className="lp-broadcast__pause">❚❚ PAUSE</span>
        </div>
        <span ref={chRef} className="lp-broadcast__osd lp-broadcast__osd--tr">CH 04</span>
        <span ref={tcRef} className="lp-broadcast__osd lp-broadcast__osd--bl">SP 00:00:00:00</span>
        <span className="lp-broadcast__osd lp-broadcast__osd--br">PARIS — BEY</span>
        <div ref={curRef} className="lp-broadcast__cursor" />
      </div>
    </section>
  );
}
