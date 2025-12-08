import React, { useEffect, useState } from 'react';

const SmallGauge270 = ({ 
  value = 0,
  max = 10,
  label = '',
  size = 200,
  isDanger = false
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min((value / max) * 100, 100);
  
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = 270;
  const valueAngle = startAngle + (percentage / 100) * totalAngle;
  
  const radius = size / 2 - 30;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 18;
  
  const fillColor = isDanger ? '#ef4444' : '#10b981';
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
      <svg width={size} height={size}>
        {/* Background arc */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, valueAngle)}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'all 1s ease-out' }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: fillColor, fontFamily: 'Manrope, sans-serif' }}>
            {value}
          </div>
          <div className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-wide">{label}</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Max: {max}</div>
        </div>
      </div>
    </div>
  );
};

export default SmallGauge270;