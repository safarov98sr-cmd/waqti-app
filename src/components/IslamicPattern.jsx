export default function IslamicPattern({ className = '' }) {
  // 8-pointed star (outer r=13, inner r=6, center 30,30, tile 60×60)
  const star = '30,17 32.3,24.5 39.2,20.8 35.5,27.7 43,30 35.5,32.3 39.2,39.2 32.3,35.5 30,43 27.7,35.5 20.8,39.2 24.5,32.3 17,30 24.5,27.7 20.8,20.8 27.7,24.5'
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ opacity: 'var(--pattern-opacity)' }}
    >
      <defs>
        <pattern id="ip" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon points={star} fill="white" />
          <polygon points={star} fill="none" stroke="white" strokeWidth="0.4" opacity="0.5" />
          {/* corner quarter-stars */}
          <polygon points={`0,${17-30+60} 2.3,${24.5-30+60} 9.2,${20.8-30+60} 5.5,${27.7-30+60} 13,30 5.5,32.3 9.2,39.2 2.3,35.5 0,43`}
            fill="white" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ip)" />
    </svg>
  )
}
