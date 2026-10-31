import React, { forwardRef, memo } from 'react';

// The field-journal mountain: paper fills, ink linework, hatching, contours, pines,
// and the trail. `ref` points at the mask stroke that "inks" the trail on scroll.
const MountainArt = forwardRef(function MountainArt({ layout, drawn }, maskRef) {
  const { W, height, art, trailD, cx, peakY, trailheadY, groundY, mobile } = layout;
  const signX = cx + (mobile ? 20 : 56);

  return (
    <svg className="peak-art" width={W} height={height} viewBox={`0 0 ${W} ${height}`}
      aria-hidden="true" focusable="false">
      <defs>
        <pattern id="peak-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <line x1="0" y1="0" x2="0" y2="6" className="peak-art__hatch-line" />
        </pattern>
        <pattern id="peak-hatch-far" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <line x1="0" y1="0" x2="0" y2="9" className="peak-art__hatch-line peak-art__hatch-line--far" />
        </pattern>
        <clipPath id="peak-clip">
          <path d={art.clipD} />
        </clipPath>
        <mask id="peak-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={height}>
          <path ref={maskRef} d={trailD} className="peak-art__trail-mask" pathLength="1000"
            strokeDasharray="1000 1000" strokeDashoffset={drawn ? 0 : 1000} />
        </mask>
      </defs>

      {/* distant ranges */}
      {art.far.map((m, i) => (
        <g key={i} className="peak-art__far">
          <path d={m.fill} className="peak-art__far-fill" />
          <path d={m.fill} fill="url(#peak-hatch-far)" className="peak-art__far-hatch" />
          <path d={m.line} className="peak-art__far-line" />
        </g>
      ))}

      {/* the mountain */}
      <path d={art.mainFill} className="peak-art__body" />
      <g clipPath="url(#peak-clip)">
        <path d={art.shadowD} fill="url(#peak-hatch)" className="peak-art__shadow" />
        <path d={art.snowCapD} className="peak-art__snow" />
        <path d={art.contours} className="peak-art__contour" />
        <path d={art.rocks} className="peak-art__rocks" />
        <path d={art.gullies} className="peak-art__gully" />
        <path d={art.ridgeD} className="peak-art__ridge" />
        <path d={art.snowLineD} className="peak-art__snow-line" />
      </g>
      <path d={art.mainLine} className="peak-art__outline" />
      <path d={art.mainLine} className="peak-art__outline peak-art__outline--sketch" transform="translate(1.6 1.1)" />

      {/* ground and pines */}
      <path d={art.meadowD} className="peak-art__meadow" />
      <path d={art.groundD} className="peak-art__ground" />
      <path d={art.grass} className="peak-art__grass" />
      {art.trees.map((t, i) => <path key={i} d={t.d} className="peak-art__tree" />)}

      <path d={art.birds} className="peak-art__birds" />

      {/* trail: faint pencil route, inked as you climb */}
      <path d={trailD} className="peak-art__trail-ghost" />
      <path d={trailD} className="peak-art__trail" mask="url(#peak-trail-mask)" />
      <path d={art.leaders} className="peak-art__leader" />

      {/* trailhead signpost */}
      <g className="peak-art__sign">
        <path d={`M ${signX} ${groundY + 4} L ${signX} ${trailheadY - 40}`} className="peak-art__post" />
        <path d={`M ${signX - 4} ${trailheadY - 60} L ${signX + 70} ${trailheadY - 60} L ${signX + 80} ${trailheadY - 49} L ${signX + 70} ${trailheadY - 38} L ${signX - 4} ${trailheadY - 38} Z`}
          className="peak-art__board" />
        <text x={signX + 4} y={trailheadY - 43} className="peak-art__sign-text">Base camp</text>
      </g>

      {/* summit flag */}
      <g className="peak-art__flag">
        <path d={`M ${cx} ${peakY + 2} L ${cx} ${peakY - 54}`} className="peak-art__pole" />
        <path d={`M ${cx + 1} ${peakY - 54} C ${cx + 14} ${peakY - 58} ${cx + 22} ${peakY - 46} ${cx + 38} ${peakY - 49} L ${cx + 31} ${peakY - 39} L ${cx + 38} ${peakY - 30} C ${cx + 22} ${peakY - 27} ${cx + 14} ${peakY - 38} ${cx + 1} ${peakY - 34} Z`}
          className="peak-art__pennant" />
      </g>
    </svg>
  );
});

export default memo(MountainArt);
