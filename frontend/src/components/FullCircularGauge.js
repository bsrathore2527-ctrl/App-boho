import React, { useEffect, useState } from 'react';

const FullCircularGauge = ({ 
  realised = 0,
  unrealised = 0,
  total = 0,
  maxLoss = 500,
  maxProfit = 1000,
  trailStep = 250,
  size = 400
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(total);
    }, 100);
    return () => clearTimeout(timer);
  }, [total]);

  // Calculate ratio and arc angles for full 360° circle
  const totalRange = maxLoss + maxProfit;
  const lossArcDegrees = (maxLoss / totalRange) * 360;
  const profitArcDegrees = (maxProfit / totalRange) * 360;
  
  // Center at top (0°)
  const centerAngle = 0;
  const lossStartAngle = centerAngle - lossArcDegrees;
  const lossEndAngle = centerAngle;
  const profitStartAngle = centerAngle;
  const profitEndAngle = centerAngle + profitArcDegrees;
  
  const radius = size / 2 - 50;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 32;
  
  const isProfit = total >= 0;
  const absTotal = Math.abs(total);
  const maxValue = isProfit ? maxProfit : maxLoss;
  const percentage = Math.min((absTotal / maxValue) * 100, 100);
  
  // Calculate fill angle
  let fillAngle;
  if (isProfit) {
    fillAngle = centerAngle + (percentage / 100) * profitArcDegrees;
  } else {
    fillAngle = centerAngle - (percentage / 100) * lossArcDegrees;
  }
  
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
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
  
  // Generate trail step marks
  const generateStepMarks = (isLossSection) => {
    const marks = [];
    const maxVal = isLossSection ? maxLoss : maxProfit;
    const arcDegrees = isLossSection ? lossArcDegrees : profitArcDegrees;
    const numSteps = Math.floor(maxVal / trailStep);
    
    for (let i = 1; i <= numSteps; i++) {
      const stepValue = i * trailStep;
      const stepPercentage = stepValue / maxVal;
      const stepAngle = isLossSection 
        ? centerAngle - (stepPercentage * arcDegrees)
        : centerAngle + (stepPercentage * arcDegrees);
      
      const innerPos = polarToCartesian(centerX, centerY, radius - strokeWidth/2 - 5, stepAngle);
      const outerPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 5, stepAngle);
      
      marks.push(
        <line
          key={`${isLossSection ? 'loss' : 'profit'}-step-${i}`}
          x1={innerPos.x}
          y1={innerPos.y}
          x2={outerPos.x}
          y2={outerPos.y}
          stroke={isLossSection ? '#ef4444' : '#10b981'}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        />
      );
    }
    return marks;
  };
  
  const centerPos = polarToCartesian(centerX, centerY, radius, centerAngle);
  
  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="loss-gradient-full" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.9 }} />
          </linearGradient>
          
          <linearGradient id="profit-gradient-full" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="glow-full">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grey background tracks - pre-filled unused portions */}
        <path
          d={describeArc(centerX, centerY, radius, lossStartAngle, lossEndAngle)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        <path
          d={describeArc(centerX, centerY, radius, profitStartAngle, profitEndAngle)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Trail step marks */}
        {generateStepMarks(true)}
        {generateStepMarks(false)}
        
        {/* Center zero point */}
        <circle
          cx={centerPos.x}
          cy={centerPos.y}
          r="8"
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="3"
        />
        
        {/* Active fill arc */}
        {isProfit ? (
          <path
            d={describeArc(centerX, centerY, radius, profitStartAngle, fillAngle)}
            fill="none"
            stroke="url(#profit-gradient-full)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow-full)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ) : (
          <path
            d={describeArc(centerX, centerY, radius, fillAngle, lossEndAngle)}
            fill="none"
            stroke="url(#loss-gradient-full)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow-full)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        )}
        
        {/* Ratio indicator at top */}
        <text
          x={centerX}
          y={30}
          fill="#6b7280"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
        >
          Ratio {maxLoss}:{maxProfit} ({Math.round(lossArcDegrees)}°/{Math.round(profitArcDegrees)}°)
        </text>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div 
            className="text-5xl font-bold mb-2" 
            style={{ 
              color: isProfit ? '#059669' : '#dc2626',
              fontFamily: 'Manrope, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {isProfit ? '+' : '-'}₹{absTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs uppercase tracking-wider mb-3 text-gray-500 font-semibold">
            Total P&L
          </div>
          <div className="flex gap-5 text-sm">
            <div className="text-center">
              <div 
                className="font-bold text-base"
                style={{ color: realised >= 0 ? '#059669' : '#dc2626' }}
              >
                {realised >= 0 ? '+' : ''}₹{realised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-400">Realised</div>
            </div>
            <div className="text-center">
              <div 
                className="font-bold text-base"
                style={{ color: unrealised >= 0 ? '#059669' : '#dc2626' }}
              >
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

export default FullCircularGauge;
