// One deterministic timeline for the V2 hero. No DOM reads in these calculations.
(function (host) {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (from, to, value) => {
    const t = clamp((value - from) / (to - from));
    return t * t * (3 - 2 * t);
  };
  const curve = (a, b, c, t) => ({
    x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * b.x + t ** 2 * c.x,
    y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * b.y + t ** 2 * c.y,
  });
  const ridge = [[165,339],[263,266],[336,299],[392,192],[428,192],[507,305],[589,285],[680,380]];
  function ridgePoint(x) {
    const value = clamp(x, ridge[0][0], ridge.at(-1)[0]);
    const index = ridge.findIndex((point, i) => i < ridge.length - 1 && value >= point[0] && value <= ridge[i + 1][0]);
    const a = ridge[Math.max(0, index)], b = ridge[Math.max(0, index) + 1];
    return { x: value, y: mix(a[1], b[1], (value - a[0]) / (b[0] - a[0])) };
  }
  function projection(value, width, height) {
    const mobile = width <= 767;
    const depth = ease(.70, .94, clamp(value));
    const surfaceStart = height * (mobile ? .73 : .79);
    const surfaceY = surfaceStart - height * ((mobile ? .73 : .79) + .60) * depth;
    const iceWidth = width * (mobile ? 2.0 : 1.55) * (1 + depth * (mobile ? 1.3 : 1.8));
    const iceHeight = height * 1.25 * (1 + depth * 3.2);
    const approach = ease(.64, 1, clamp(value));
    const zoom = 1 + approach * 1.35;
    const walkPan = ease(.16, .66, clamp(value));
    const centerX = mix(mix(400, mobile ? 205 : 290, walkPan), 420, depth);
    return {
      depth, surfaceY, width: iceWidth * zoom, height: iceHeight * zoom,
      left: width * .5 - iceWidth * zoom * centerX / 800,
      top: surfaceY - iceHeight * zoom * 401 / 980,
    };
  }
  function frame(value, geometry) {
    const p = clamp(value);
    const { width, height } = geometry;
    const mobile = width <= 767;
    const character = geometry.characterWidth || (mobile ? 70 : 90);
    const ice = projection(p, width, height);
    const initialIce = projection(0, width, height);
    const ridgeStart = ridgePoint((width * .69 - initialIce.left) / initialIce.width * 800);
    const start = geometry.start || {
      x: initialIce.left + ridgeStart.x / 800 * initialIce.width,
      y: initialIce.top + ridgeStart.y / 980 * initialIce.height - (geometry.characterHeight || 84) / 2,
    };
    const characterHeight = geometry.characterHeight || (mobile ? 105 : 140);
    const startSvgX = (start.x - initialIce.left) / initialIce.width * 800;
    const walk = ease(.16, .66, p);
    const foot = ridgePoint(mix(startSvgX, 165, walk));
    const onIce = {x: ice.left + foot.x / 800 * ice.width, y: ice.top + foot.y / 980 * ice.height - characterHeight / 2};
    const jumpIce = projection(.66, width, height);
    const edge = {x: jumpIce.left + 165 / 800 * jumpIce.width, y: jumpIce.top + 339 / 980 * jumpIce.height - characterHeight / 2};
    const entry = {x: edge.x - width * .22, y: jumpIce.surfaceY + characterHeight * .55};
    const phase = p <= .16 ? 'surface' : p < .66 ? 'walk' : p < .78 ? 'dive' : p < .86 ? 'depth' : 'arrival';
    let position, angle = 0, visible = 1;
    if (p <= .16) position = start;
    else if (p <= .66) {
      position = onIce;
      // Match the exact dragged pose at the start before settling onto the ridge.
      position.y += (start.y - (initialIce.top + ridgePoint(startSvgX).y / 980 * initialIce.height - characterHeight / 2)) * (1 - walk);
    } else if (p <= .78) {
      const t = ease(.66, .78, p);
      position = curve(edge, {x: edge.x - width * .15, y: edge.y - height * .15}, entry, t);
      angle = 112 * t;
    } else if (p < .81) {
      const t = ease(.78, .81, p);
      position = curve(entry, {x: entry.x - width * .10, y: height * .74}, {x: -character * 2, y: height * .70}, t);
      angle = mix(112, 90, t);
    } else if (p < .86) {
      // Transfer outside the visible scene before the diagonal underwater pass.
      const t = ease(.81, .86, p);
      position = {x: mix(-character * 2, width + character * 2, t), y: -character * 2};
      angle = 65; visible = 0;
    } else {
      const t = ease(.86, 1, p);
      position = curve({x: width + character * 2, y: height * .23}, {x: width * .46, y: height * .44}, {x: width * .065, y: height * .70}, t);
      angle = mix(65, 90, t) * (1 - ease(.96, 1, p));
    }
    const submerge = clamp((height * (mobile ? .73 : .79) - ice.surfaceY) / height);
    const body = ease(.50, .86, p);
    return {
      destination: ease(.76, .98, p), facingLeft: p > .16, progress: p, phase, ice, surfaceY: ice.surfaceY, x: position.x, y: position.y, angle, visible,
      underwater: ease(.66, .86, p), submerge,
      dive: ease(.66, .78, p), swim: ease(.78, .86, p),
      shelf: ease(.78, .96, p), bodyReveal: body, bodyWipe: (1 - body) * 100,
      diveLabel: ease(.56, .64, p) * (1 - ease(.75, .80, p)),
      revealLabel: ease(.84, .95, p), copyOpacity: 1 - ease(.07, .19, p),
      cueOpacity: 1 - ease(.04, .14, p), light: ease(.38, .78, p),
      parallax: ease(0, .68, p), tipGone: ice.top + ice.height * 192 / 980 < 0,
      interactive: p <= .16, swimming: p > .78 && (p < .81 || (p >= .86 && p < .96)),
      waving: false, topVisible: p >= .90,
      headerDark: ice.surfaceY < (geometry.headerHeight || 80) && ice.depth > .60,
    };
  }
  function settle(current, target, milliseconds) {
    if (current === null || !Number.isFinite(current)) return target;
    const t = 1 - Math.exp(-clamp(milliseconds, 0, 64) / 85);
    const next = mix(current, target, t);
    return Math.abs(target - next) < .0002 ? target : next;
  }
  host.heroMotion = { frame, projection, settle, clamp, ease, ridge, ridgePoint };
})(window);
