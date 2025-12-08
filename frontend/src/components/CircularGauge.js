import React, { useEffect, useState } from 'react';

const CircularGauge = ({ 
  value, 
  min, 
  max, 
  label, 
  unit = '',
  size = 200,
  showTicks = true,
  colors = ['#D56F53', '#E4AD75', '#5F8BC1'],
  type = 'default'
}) => {
  const [animatedValue, setAnimatedValue] = useState(min);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;
  
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Create gradient based on value
  const getColor = () => {
    if (type === 'pnl') {
      return value >= 0 ? colors[2] : colors[0];
    } else if (type === 'loss') {
      return colors[0];
    } else if (type === 'cooldown') {
      return colors[2];
    }
    return colors[1];
  };
  
  const mainColor = getColor();
  
  // Generate arc path
  const generateArc = (startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };
  
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  const needleEnd = polarToCartesian(centerX, centerY, radius - 10, angle + 90);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gauge-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {type === 'pnl' ? (
              <>
                <stop offset="0%" style={{ stopColor: colors[0], stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: colors[1], stopOpacity: 0.7 }} />
                <stop offset="100%" style={{ stopColor: colors[2], stopOpacity: 1 }} />
              </>
            ) : (
              <>
                <stop offset="0%" style={{ stopColor: mainColor, stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: mainColor, stopOpacity: 1 }} />
              </>
            )}
          </linearGradient>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path
          d={generateArc(0, 180)}
          fill="none"
          stroke="rgba(95, 139, 193, 0.15)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Tick marks */}
        {showTicks && Array.from({ length: 13 }).map((_, i) => {
          const tickAngle = (i * 15);
          const isMainTick = i % 3 === 0;
          const tickLength = isMainTick ? 8 : 4;
          const innerRadius = radius - tickLength;
          const outerRadius = radius;
          const start = polarToCartesian(centerX, centerY, innerRadius, tickAngle);
          const end = polarToCartesian(centerX, centerY, outerRadius, tickAngle);
          
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(178, 215, 232, 0.3)"
              strokeWidth={isMainTick ? 2 : 1}
            />
          );
        })}
        
        {/* Value arc */}
        <path
          d={generateArc(0, (animatedValue - min) / (max - min) * 180)}
          fill="none"
          stroke={type === 'pnl' ? `url(#gauge-gradient-${label})` : mainColor}
          strokeWidth="12"
          strokeLinecap="round"
          filter={`url(#glow-${label})`}
          style={{ transition: 'all 1s ease-out' }}
        />
        
        {/* Needle */}
        <g style={{ transition: 'all 0.5s ease-out' }}>
          <line
            x1={centerX}
            y1={centerY}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={mainColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="6"
            fill={mainColor}
          />
        </g>
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '55%' }}>
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: mainColor, fontFamily: 'Manrope, sans-serif' }}>
            {type === 'cooldown' && value > 0 ? `-${Math.abs(value)}${unit}` : `${value >= 0 ? '+' : ''}${value}${unit}`}
          </div>
          <div className="text-sm text-[#99BAD7] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularGauge;