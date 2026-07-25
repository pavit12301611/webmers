import { memo } from 'react';

const GridPattern = memo(function GridPattern({
  id = 'grid',
  className = '',
  opacity = 0.04,
  stroke = '#64748b',
}: {
  id?: string;
  className?: string;
  opacity?: number;
  stroke?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ opacity }} aria-hidden="true">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={stroke} strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
});

export default GridPattern;
