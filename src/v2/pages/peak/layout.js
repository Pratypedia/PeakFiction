// Geometry for the Peak page: where each stop, card and bit of illustration goes.
// Everything is in section pixels (the SVG's viewBox is the section's size), so the
// HTML markers/cards and the drawing line up exactly.

export const MOBILE_BREAKPOINT = 720;
export const SIDE_GAUGE_MIN = 900;

/** Small deterministic PRNG so the drawing looks the same on every render. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;
const pts = (list) => list.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(' L ');

/** Positions for the stops, cards and trail. `count` stops, rank 1 at the top. */
export function computeLayout(width, count) {
  const W = Math.max(320, Math.round(width));
  const mobile = W < MOBILE_BREAKPOINT;

  const peakY = mobile ? 110 : 140;
  const firstGap = mobile ? 150 : 190;
  const topGap = mobile ? 178 : 196; // between the summit three
  const rowGap = mobile ? 128 : 126;
  const afterTopGap = mobile ? 150 : 150;

  const ys = [];
  let y = peakY + firstGap;
  for (let rank = 1; rank <= count; rank++) {
    ys.push(y);
    y += rank < 3 ? topGap : rank === 3 ? afterTopGap : rowGap;
  }
  const lastY = ys[ys.length - 1];
  const trailheadY = lastY + (mobile ? 120 : 150);
  const groundY = trailheadY + 26;
  const height = groundY + (mobile ? 230 : 250);

  const cx = mobile ? 34 : W / 2;
  const gap = mobile ? 22 : 34; // marker centre → card edge
  const edge = mobile ? 12 : W >= 1100 ? 104 : W >= SIDE_GAUGE_MIN ? 92 : 24;
  // ≥900px the altimeter sits in the right margin (see PeakPage.css), so keep cards clear of it


  const stops = [];
  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const top = rank <= 3;
    const side = rank % 2 === 1 ? 1 : -1; // odd ranks right, even left
    let mx;
    let cardX;
    let cardW;
    if (mobile) {
      const amp = rank === 1 ? 0 : 9;
      mx = cx + side * amp;
      cardX = cx + 9 + gap;
      cardW = W - cardX - edge;
    } else {
      const wantCard = top ? (W >= 1100 ? 380 : 330) : (W >= 1100 ? 300 : 260);
      const t = count > 2 ? Math.max(0, (rank - 2) / (count - 2)) : 0;
      const wantAmp = rank === 1 ? 0 : lerp(72, Math.min(290, W * 0.2), Math.pow(t, 0.7));
      const amp = Math.min(wantAmp, Math.max(rank === 1 ? 0 : 26, W / 2 - wantCard - gap - edge));
      cardW = Math.min(wantCard, W / 2 - amp - gap - edge);
      mx = cx + side * amp;
      cardX = side === 1 ? mx + gap : mx - gap - cardW;
    }
    stops.push({ rank, top, side: mobile ? 1 : side, x: mx, y: ys[i], cardX, cardW });
  }

  // Trail: trailhead → #N … → #1 → summit, as cubic segments.
  const trailhead = [cx, trailheadY];
  const summit = [cx, peakY + 6];
  const nodes = [trailhead, ...[...stops].reverse().map(s => [s.x, s.y]), summit];
  const segs = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const [ax, ay] = nodes[i];
    const [bx, by] = nodes[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    let c1;
    let c2;
    if (i === 0 || i === nodes.length - 2 || Math.abs(dx) < 30) {
      c1 = [ax, ay + dy * 0.5];
      c2 = [bx, by - dy * 0.5];
      if (i === 0) c2 = [bx - dx * 0.6, by];
    } else {
      // switchback: leave and arrive horizontally, so each stop is a hairpin turn
      c1 = [ax + dx * 0.62, ay + dy * 0.1];
      c2 = [bx - dx * 0.62, by - dy * 0.1];
    }
    segs.push([[ax, ay], c1, c2, [bx, by]]);
  }
  const trailD = `M ${r1(nodes[0][0])} ${r1(nodes[0][1])} ` +
    segs.map(([, c1, c2, b]) => `C ${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(b[0])} ${r1(b[1])}`).join(' ');

  // Sample the trail so scroll position (a y value) maps to a drawn fraction.
  const sampleY = [];
  const sampleLen = [];
  let total = 0;
  let prev = nodes[0];
  sampleY.push(prev[1]);
  sampleLen.push(0);
  for (const [a, c1, c2, b] of segs) {
    for (let k = 1; k <= 24; k++) {
      const t = k / 24;
      const u = 1 - t;
      const px = u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0];
      const py = u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1];
      total += Math.hypot(px - prev[0], py - prev[1]);
      prev = [px, py];
      sampleY.push(py);
      sampleLen.push(total);
    }
  }

  /** Fraction of the trail (from the trailhead) lying below section-y `focusY`. */
  function drawnAt(focusY) {
    if (focusY >= sampleY[0]) return 0;
    for (let i = 1; i < sampleY.length; i++) {
      if (sampleY[i] <= focusY) {
        const y0 = sampleY[i - 1];
        const y1 = sampleY[i];
        const f = y0 === y1 ? 1 : (y0 - focusY) / (y0 - y1);
        return lerp(sampleLen[i - 1], sampleLen[i], f) / total;
      }
    }
    return 1;
  }

  return {
    W, height, mobile, cx, peakY, groundY, trailheadY, stops, trailD, drawnAt,
    art: drawArt({ W, height, mobile, cx, peakY, groundY, trailheadY, stops }),
  };
}

// ───────────────────────── Illustration ─────────────────────────

function mountain({ cx, peakY, bottomY, hwBase, k, seed, wobble = 1 }) {
  const rand = rng(seed);
  // Pointed at the top (finite slope), flaring out towards the base.
  const profile = (t) => ((1 + k) * t) / (1 + k * t);
  const span = bottomY - peakY;
  const steps = Math.max(12, Math.ceil(span / 20));
  const flank = (side, phase) => {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let hw = hwBase * profile(t);
      hw += wobble * (Math.sin(t * 11 + phase) * 16 * t + Math.sin(t * 37 + phase * 2) * 5 * t);
      hw += wobble * (rand() - 0.5) * (3 + 12 * t);
      // rugged in pixel terms too, so tall stretches don't read as straight walls
      const py = t * span;
      hw += wobble * Math.min(1, t * 8) * (Math.sin(py * 0.006 + phase * 3) * 26 + Math.sin(py * 0.017 + phase) * 9);
      out.push([cx + side * Math.max(0, hw), peakY + t * span]);
    }
    return out;
  };
  const left = flank(-1, 0.6);
  const right = flank(1, 2.1);
  return { left, right, span, hw: (t) => hwBase * profile(Math.max(0, t)) };
}

function outlineD(m) {
  return `M ${pts([...m.left].reverse())} L ${pts(m.right)}`;
}
function fillD(m) {
  return `${outlineD(m)} Z`;
}

function pine(x, base, h, rand) {
  const w = h * (0.28 + rand() * 0.08);
  const tiers = 3 + Math.round(rand());
  const trunk = h * 0.12;
  const top = base - h;
  const body = h - trunk;
  const right = [];
  for (let j = 1; j <= tiers; j++) {
    const yy = top + (body * j) / tiers;
    const ww = (w * j) / tiers;
    right.push([x + ww + (rand() - 0.5) * 2, yy]);
    if (j < tiers) right.push([x + ww * 0.42, yy - body / tiers * 0.12]);
  }
  const left = right.map(([px, py]) => [2 * x - px + (rand() - 0.5) * 2, py]).reverse();
  const d = `M ${r1(x)} ${r1(top)} L ${pts(right)} L ${r1(x + 2)} ${r1(base - trunk)} L ${r1(x + 1.6)} ${r1(base)} ` +
    `L ${r1(x - 1.6)} ${r1(base)} L ${r1(x - 2)} ${r1(base - trunk)} L ${pts(left)} Z`;
  return d;
}

function drawArt({ W, height, mobile, cx, peakY, groundY, trailheadY, stops }) {
  const bottomY = groundY + 80;
  const main = mountain({
    cx, peakY, bottomY,
    hwBase: mobile ? W * 1.25 : Math.max(W * 0.64, 460),
    k: 2.4, seed: 7,
  });
  const span = main.span;

  // Distant ranges, peaking lower down the page.
  const far = mobile
    ? [mountain({ cx: W * 0.86, peakY: groundY - span * 0.5, bottomY, hwBase: W * 0.9, k: 1.2, seed: 21, wobble: 0.6 })]
    : [
      mountain({ cx: W * 0.1, peakY: groundY - span * 0.46, bottomY, hwBase: W * 0.5, k: 1.4, seed: 11, wobble: 0.8 }),
      mountain({ cx: W * 0.92, peakY: groundY - span * 0.36, bottomY, hwBase: W * 0.46, k: 1.6, seed: 31, wobble: 0.8 }),
    ];

  const rand = rng(99);

  // Ridge separating the lit face from the hatched shadow face.
  const ridge = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const hw = main.hw(t);
    const py = t * span;
    const off = hw * (0.16 + 0.12 * Math.sin(t * 6.5 + 0.4)) +
      Math.min(1, t * 10) * (Math.sin(py * 0.0045 + 1) * 70 + Math.sin(py * 0.013) * 22) + (rand() - 0.5) * 10 * t;
    ridge.push([cx + off, peakY + t * span]);
  }
  const shadowD = `M ${pts(ridge)} L ${pts([...main.right].reverse())} Z`;
  const ridgeD = `M ${pts(ridge.slice(0, 68))}`;

  // Gullies on the shadow side.
  const gullies = [];
  for (let g = 0; g < (mobile ? 5 : 9); g++) {
    const t0 = 0.04 + rand() * 0.75;
    const start = ridge[Math.round(t0 * 80)];
    const len = 60 + rand() * 160;
    const line = [start];
    for (let k = 1; k <= 6; k++) {
      const p = line[line.length - 1];
      line.push([p[0] + len / 6 * (0.5 + rand() * 0.5), p[1] + len / 6 * (0.7 + rand() * 0.4)]);
    }
    gullies.push(`M ${pts(line)}`);
  }

  // Snow cap: region above a jagged line not far below the peak.
  const snowY = peakY + span * (mobile ? 0.055 : 0.062);
  const snow = [];
  for (let x = -20; x <= W + 20; x += 13) {
    const drip = rand() < 0.16 ? 14 + rand() * 18 : 0;
    snow.push([x, snowY + (rand() - 0.5) * 10 + drip + Math.sin(x * 0.02) * 6]);
  }
  const snowCapD = `M -20 -20 L ${W + 20} -20 L ${pts([...snow].reverse())} Z`;
  const snowLineD = `M ${pts(snow)}`;

  // Contour lines across the face.
  const contours = [];
  const nContours = mobile ? 9 : 11;
  for (let k = 1; k <= nContours; k++) {
    const t = 0.09 + 0.86 * Math.pow(k / nContours, 1.15);
    const yy = peakY + t * span;
    const line = [];
    for (let x = -10; x <= W + 10; x += 28) {
      line.push([x, yy + Math.sin(x * 0.011 + k * 1.3) * 9 + Math.sin(x * 0.037 + k) * 3]);
    }
    contours.push(`M ${pts(line)}`);
  }

  // Scattered rock strokes on the lit face.
  let rocks = '';
  for (let i = 0; i < (mobile ? 30 : 60); i++) {
    const t = 0.08 + rand() * 0.86;
    const yy = peakY + t * span;
    const hw = main.hw(t);
    const x = cx - hw * (0.1 + rand() * 0.85);
    const l = 5 + rand() * 9;
    rocks += `M ${r1(x)} ${r1(yy)} l ${r1(l)} ${r1(-l * 0.45)} m ${r1(-l * 0.2)} ${r1(l * 0.45 + 3)} l ${r1(l * 0.55)} ${r1(-l * 0.22)} `;
  }

  // Ground line + grass ticks.
  const ground = [];
  for (let x = -10; x <= W + 10; x += 18) ground.push([x, groundY + (rand() - 0.5) * 4 + Math.sin(x * 0.013) * 5]);
  const groundD = `M ${pts(ground)}`;
  const meadowD = `${groundD} L ${W + 10} ${height + 10} L -10 ${height + 10} Z`;
  let grass = '';
  for (let x = 6; x < W; x += 9 + rand() * 22) {
    const gy = groundY + 6 + rand() * 40;
    const h = 3 + rand() * 5;
    grass += `M ${r1(x)} ${r1(gy)} l ${r1(-1.5)} ${r1(-h)} M ${r1(x + 3)} ${r1(gy)} l ${r1(1)} ${r1(-h * 0.8)} `;
  }

  // Pine trees around the base, keeping clear of the trailhead and the cards.
  const trees = [];
  const clearOf = (x, yb) => {
    if (Math.abs(x - cx) < (mobile ? 40 : 110) && yb > trailheadY - 60) return false;
    // up on the slopes, stay out of the switchbacks
    const trailSpan = mobile ? 30 : Math.max(...stops.map(s => Math.abs(s.x - cx))) + 40;
    if (yb < groundY - 24 && Math.abs(x - cx) < trailSpan) return false;
    for (const s of stops) {
      if (yb > s.y - 60 - 40 && yb < s.y + 70 + 80) {
        const x0 = Math.min(s.x - 24, s.cardX) - 12;
        const x1 = Math.max(s.x + 24, s.cardX + s.cardW) + 12;
        if (x > x0 && x < x1) return false;
      }
    }
    return true;
  };
  const nTrees = Math.round(W / (mobile ? 26 : 30));
  for (let i = 0; i < nTrees * 3 && trees.length < nTrees; i++) {
    const x = rand() * W;
    const band = rand();
    const yb = groundY + 6 - band * band * (mobile ? 120 : 220) + rand() * 18;
    const h = 26 + rand() * 34 + (yb > groundY - 20 ? 12 : 0);
    if (!clearOf(x, yb)) continue;
    trees.push({ y: yb, d: pine(x, yb, h, rand) });
  }
  trees.sort((a, b) => a.y - b.y);

  // Leader lines from each marker to its card.
  const leaders = stops.map(s => {
    const r = s.top ? 25 : 19;
    const x0 = s.cardX > s.x ? s.x + r : s.x - r;
    const x1 = s.cardX > s.x ? s.cardX - 2 : s.cardX + s.cardW + 2;
    return `M ${r1(x0)} ${r1(s.y)} L ${r1(x1)} ${r1(s.y)}`;
  }).join(' ');

  // Birds near the summit.
  const birds = (mobile
    ? [[W * 0.55, peakY - 30, 1], [W * 0.68, peakY - 5, 0.8]]
    : [[cx - 260, peakY - 40, 1.1], [cx - 220, peakY - 70, 0.8], [cx + 230, peakY + 10, 0.9]])
    .map(([x, y, s]) => `M ${r1(x - 9 * s)} ${r1(y)} q ${r1(4.5 * s)} ${r1(-6 * s)} ${r1(9 * s)} 0 q ${r1(4.5 * s)} ${r1(-6 * s)} ${r1(9 * s)} 0`)
    .join(' ');

  return {
    far: far.map(m => ({ fill: fillD(m), line: outlineD(m) })),
    mainFill: fillD(main),
    mainLine: outlineD(main),
    shadowD, ridgeD, gullies: gullies.join(' '), snowCapD, snowLineD,
    contours: contours.join(' '), rocks, groundD, meadowD, grass, trees, leaders, birds,
    clipD: fillD(main),
  };
}
