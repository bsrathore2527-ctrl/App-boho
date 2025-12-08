import React, { useEffect, useState } from 'react';

const DynamicPnLGauge = ({ 
  realised = 0,
  unrealised = 0,
  total = 0,
  maxLoss = 500,
  maxProfit = 500,
  trailStep = 250,
  size = 420
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(total);
    }, 200);
    return () => clearTimeout(timer);
  }, [total]);

  // Calculate dynamic arc angles based on ratio
  const totalDegrees = 270;
  const totalRange = maxLoss + maxProfit;
  const lossArcDegrees = (maxLoss / totalRange) * totalDegrees;
  const profitArcDegrees = (maxProfit / totalRange) * totalDegrees;
  
  // Center point at top (270° gauge from -135° to 135°)
  const centerAngle = -90; // Top center
  const lossStartAngle = centerAngle - lossArcDegrees;
  const lossEndAngle = centerAngle;
  const profitStartAngle = centerAngle;
  const profitEndAngle = centerAngle + profitArcDegrees;
  
  const radius = size / 2 - 60;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 36;
  
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
      
      const innerPos = polarToCartesian(centerX, centerY, radius - strokeWidth/2 - 8, stepAngle);
      const outerPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 8, stepAngle);
      const labelPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 28, stepAngle);
      
      marks.push(
        <g key={`${isLossSection ? 'loss' : 'profit'}-step-${i}`}>
          <line
            x1={innerPos.x}
            y1={innerPos.y}
            x2={outerPos.x}
            y2={outerPos.y}
            stroke={isLossSection ? '#ef4444' : '#10b981'}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            fill="#6b7280"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {stepValue}
          </text>
        </g>
      );
    }
    return marks;
  };
  
  const centerPos = polarToCartesian(centerX, centerY, radius, centerAngle);
  const maxLossPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 50, lossStartAngle);
  const maxProfitPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 50, profitEndAngle);
  
  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ 
        width: size, 
        height: size,
        background: 'radial-gradient(circle, #ffffff 0%, #fef3c7 100%)',
        borderRadius: '50%',
        boxShadow: '0 20px 60px rgba(249, 115, 22, 0.15), inset 0 0 40px rgba(249, 115, 22, 0.05)'
      }}
    >
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="loss-gradient-dynamic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
          </linearGradient>
          
          <linearGradient id="profit-gradient-dynamic" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="glow-effect">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background tracks */}
        <path
          d={describeArc(centerX, centerY, radius, lossStartAngle, lossEndAngle)}
          fill="none"
          stroke="#fee2e2"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.5"
        />
        
        <path
          d={describeArc(centerX, centerY, radius, profitStartAngle, profitEndAngle)}
          fill="none"
          stroke="#d1fae5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Trail step marks */}
        {generateStepMarks(true)}
        {generateStepMarks(false)}
        
        {/* Center zero point indicator */}
        <circle
          cx={centerPos.x}
          cy={centerPos.y}
          r="10"
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <text
          x={centerPos.x}
          y={centerPos.y - 22}
          fill="#f97316"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
        >
          0
        </text>
        
        {/* Active fill arc */}
        {isProfit ? (
          <path
            d={describeArc(centerX, centerY, radius, profitStartAngle, fillAngle)}
            fill="none"
            stroke="url(#profit-gradient-dynamic)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow-effect)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ) : (
          <path
            d={describeArc(centerX, centerY, radius, fillAngle, lossEndAngle)}
            fill="none"
            stroke="url(#loss-gradient-dynamic)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow-effect)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        )}
        
        {/* Max Loss label */}
        <g>
          <rect
            x={maxLossPos.x - 35}
            y={maxLossPos.y - 12}
            width="70"
            height="24"
            fill="#fee2e2"
            rx="4"
          />
          <text
            x={maxLossPos.x}
            y={maxLossPos.y + 4}
            fill="#dc2626"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            -₹{maxLoss.toLocaleString()}
          </text>
        </g>
        
        {/* Max Profit label */}
        <g>
          <rect
            x={maxProfitPos.x - 35}
            y={maxProfitPos.y - 12}
            width="70"
            height="24"
            fill="#d1fae5"
            rx="4"
          />
          <text
            x={maxProfitPos.x}
            y={maxProfitPos.y + 4}
            fill="#059669"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            +₹{maxProfit.toLocaleString()}
          </text>
        </g>
        
        {/* Ratio indicator */}
        <text
          x={centerX}
          y={20}
          fill="#f97316"
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
            className="text-6xl font-bold mb-3" 
            style={{ 
              color: isProfit ? '#059669' : '#dc2626',
              fontFamily: 'Manrope, sans-serif',
              textShadow: isProfit 
                ? '0 4px 12px rgba(5, 150, 105, 0.3)' 
                : '0 4px 12px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.5s ease'
            }}
          >
            {isProfit ? '+' : '-'}₹{absTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs uppercase tracking-wider mb-4 text-gray-500 font-semibold">
            Total P&L
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div 
                className="font-bold text-lg"
                style={{ color: realised >= 0 ? '#059669' : '#dc2626' }}
              >
                {realised >= 0 ? '+' : ''}₹{realised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-400 font-medium">Realised</div>
            </div>
            <div className="text-center">
              <div 
                className="font-bold text-lg"
                style={{ color: unrealised >= 0 ? '#059669' : '#dc2626' }}
              >
                {unrealised >= 0 ? '+' : ''}₹{unrealised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-400 font-medium">Unrealised</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPnLGauge;
