import React, { useEffect, useState } from 'react';

const CircularGauge270 = ({ 
  realised = 0,
  unrealised = 0,
  total = 0,
  maxLoss = 5000,
  maxProfit = 10000,
  size = 320
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(total);
    }, 100);
    return () => clearTimeout(timer);
  }, [total]);

  const isProfit = total >= 0;
  const absTotal = Math.abs(total);
  const maxValue = isProfit ? maxProfit : maxLoss;
  const percentage = Math.min((absTotal / maxValue) * 100, 100);
  
  // 270 degrees = 3/4 of circle, starting from bottom left (-135deg) to bottom right (135deg)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = 270;
  const valueAngle = startAngle + (percentage / 100) * totalAngle;
  
  const radius = size / 2 - 40;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 28;
  
  // Colors based on profit/loss
  const fillColor = isProfit ? '#10b981' : '#ef4444'; // green : red
  const bgColor = '#f3f4f6';
  
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };
  
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform rotate-0">
        <defs>
          <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: fillColor, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: fillColor, stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc with animation */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, valueAngle)}
          fill="none
          stroke="url(#gauge-fill)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#shadow)"
          style={{ 
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center'
          }}
        />
        
        {/* Tick marks */}
        {Array.from({ length: 10 }).map((_, i) => {
          const tickAngle = startAngle + (i * (totalAngle / 9));
          const isMainTick = i % 3 === 0;
          const tickLength = isMainTick ? 12 : 6;
          const outerRadius = radius + strokeWidth / 2 + 8;
          const innerRadius = outerRadius - tickLength;
          const start = polarToCartesian(centerX, centerY, innerRadius, tickAngle);
          const end = polarToCartesian(centerX, centerY, outerRadius, tickAngle);
          
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#9ca3af"
              strokeWidth={isMainTick ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2" style={{ color: fillColor, fontFamily: 'Manrope, sans-serif' }}>
            {isProfit ? '+' : '-'}₹{absTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-3">Total P&L</div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-semibold">+₹{realised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-gray-400">Realised</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${unrealised >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {unrealised >= 0 ? '+' : ''}₹{unrealised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-400">Unrealised</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularGauge270;