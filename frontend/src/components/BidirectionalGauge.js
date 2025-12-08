import React, { useEffect, useState } from 'react';

const BidirectionalGauge = ({ 
  realised = 0,
  unrealised = 0,
  total = 0,
  maxLoss = 500,
  maxProfit = 500,
  trailStep = 250,
  size = 400,
  isDark = false
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(total);
    }, 100);
    return () => clearTimeout(timer);
  }, [total]);

  // Calculate ratio and arc angles
  const ratio = maxLoss / maxProfit;
  const totalDegrees = 270;
  
  // Calculate arc angles based on ratio
  const lossArc = (maxLoss / (maxLoss + maxProfit)) * totalDegrees;
  const profitArc = (maxProfit / (maxLoss + maxProfit)) * totalDegrees;
  
  // Starting angle (top center)
  const centerAngle = -90; // Top center
  const lossStartAngle = centerAngle - lossArc;
  const lossEndAngle = centerAngle;
  const profitStartAngle = centerAngle;
  const profitEndAngle = centerAngle + profitArc;
  
  const radius = size / 2 - 50;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 32;
  
  // Futuristic colors
  const colors = {
    light: {
      loss: '#ef4444',
      profit: '#10b981',
      lossGlow: 'rgba(239, 68, 68, 0.6)',
      profitGlow: 'rgba(16, 185, 129, 0.6)',
      bg: '#1f2937',
      text: '#ffffff',
      textMuted: '#9ca3af',
      track: '#374151'
    },
    dark: {
      loss: '#ff0844',
      profit: '#00ff88',
      lossGlow: 'rgba(255, 8, 68, 0.8)',
      profitGlow: 'rgba(0, 255, 136, 0.8)',
      bg: '#0a0a0f',
      text: '#00ff88',
      textMuted: '#4a5568',
      track: '#1a1a2e'
    }
  };
  
  const theme = isDark ? colors.dark : colors.light;
  
  const isProfit = total >= 0;
  const absTotal = Math.abs(total);
  const maxValue = isProfit ? maxProfit : maxLoss;
  const percentage = Math.min((absTotal / maxValue) * 100, 100);
  
  // Calculate fill angle
  let fillAngle;
  if (isProfit) {
    fillAngle = centerAngle + (percentage / 100) * profitArc;
  } else {
    fillAngle = centerAngle - (percentage / 100) * lossArc;
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
  const generateStepMarks = (isLoss) => {
    const marks = [];
    const max = isLoss ? maxLoss : maxProfit;
    const arc = isLoss ? lossArc : profitArc;
    const startAngle = isLoss ? lossStartAngle : profitStartAngle;
    const numSteps = Math.floor(max / trailStep);
    
    for (let i = 1; i <= numSteps; i++) {
      const stepAngle = isLoss 
        ? centerAngle - (i * trailStep / max) * arc
        : centerAngle + (i * trailStep / max) * arc;
      
      const innerPos = polarToCartesian(centerX, centerY, radius - strokeWidth/2 - 5, stepAngle);
      const outerPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 5, stepAngle);
      const labelPos = polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 25, stepAngle);
      
      marks.push(
        <g key={`${isLoss ? 'loss' : 'profit'}-${i}`}>
          <line
            x1={innerPos.x}
            y1={innerPos.y}
            x2={outerPos.x}
            y2={outerPos.y}
            stroke={theme.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            fill={theme.textMuted}
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {i * trailStep}
          </text>
        </g>
      );
    }
    return marks;
  };
  
  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ 
        width: size, 
        height: size,
        background: isDark ? 'radial-gradient(circle, #1a1a2e 0%, #0a0a0f 100%)' : 'radial-gradient(circle, #2d3748 0%, #1a202c 100%)',
        borderRadius: '50%',
        boxShadow: isDark 
          ? '0 0 40px rgba(0, 255, 136, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)'
          : '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(0, 0, 0, 0.3)'
      }}
    >
      <svg width={size} height={size} className="transform rotate-0">
        <defs>
          {/* Loss gradient */}
          <linearGradient id="loss-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: theme.loss, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: theme.loss, stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Profit gradient */}
          <linearGradient id="profit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: theme.profit, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: theme.profit, stopOpacity: 0.6 }} />
          </linearGradient>
          
          {/* Glow filters */}
          <filter id="loss-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="profit-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Pulsing animation */}
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background track - Loss side */}
        <path
          d={describeArc(centerX, centerY, radius, lossStartAngle, lossEndAngle)}
          fill="none"
          stroke={theme.track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Background track - Profit side */}
        <path
          d={describeArc(centerX, centerY, radius, profitStartAngle, profitEndAngle)}
          fill="none"
          stroke={theme.track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Trail step marks */}
        {generateStepMarks(true)}
        {generateStepMarks(false)}
        
        {/* Center point indicator */}
        <circle
          cx={polarToCartesian(centerX, centerY, radius, centerAngle).x}
          cy={polarToCartesian(centerX, centerY, radius, centerAngle).y}
          r="6"
          fill={theme.text}
          opacity="0.8"
        />
        
        {/* Active arc */}
        {isProfit ? (
          <path
            d={describeArc(centerX, centerY, radius, profitStartAngle, fillAngle)}
            fill="none"
            stroke="url(#profit-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#profit-glow)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: isDark ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          />
        ) : (
          <path
            d={describeArc(centerX, centerY, radius, fillAngle, lossEndAngle)}
            fill="none"
            stroke="url(#loss-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#loss-glow)"
            style={{ 
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: isDark ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          />
        )}
        
        {/* Max Loss label */}
        <text
          x={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, lossStartAngle).x}
          y={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, lossStartAngle).y}
          fill={theme.loss}
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(255, 8, 68, 0.8))' : 'none' }}
        >
          -₹{maxLoss}
        </text>
        
        {/* Max Profit label */}
        <text
          x={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, profitEndAngle).x}
          y={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, profitEndAngle).y}
          fill={theme.profit}
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))' : 'none' }}
        >
          +₹{maxProfit}
        </text>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div 
            className="text-6xl font-bold mb-3" 
            style={{ 
              color: isProfit ? theme.profit : theme.loss,
              fontFamily: 'Orbitron, Manrope, sans-serif',
              textShadow: isDark 
                ? `0 0 20px ${isProfit ? theme.profitGlow : theme.lossGlow}, 0 0 40px ${isProfit ? theme.profitGlow : theme.lossGlow}`
                : '0 4px 8px rgba(0,0,0,0.3)',
              animation: isDark ? 'textPulse 2s ease-in-out infinite' : 'none'
            }}
          >
            {isProfit ? '+' : '-'}₹{absTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div 
            className="text-xs uppercase tracking-wider mb-4" 
            style={{ color: theme.textMuted }}
          >
            Total P&L
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div 
                className="font-bold text-lg"
                style={{ 
                  color: realised >= 0 ? theme.profit : theme.loss,
                  textShadow: isDark ? `0 0 10px ${realised >= 0 ? theme.profitGlow : theme.lossGlow}` : 'none'
                }}
              >
                {realised >= 0 ? '+' : ''}₹{realised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>Realised</div>
            </div>
            <div className="text-center">
              <div 
                className="font-bold text-lg"
                style={{ 
                  color: unrealised >= 0 ? theme.profit : theme.loss,
                  textShadow: isDark ? `0 0 10px ${unrealised >= 0 ? theme.profitGlow : theme.lossGlow}` : 'none'
                }}
              >
                {unrealised >= 0 ? '+' : ''}₹{unrealised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>Unrealised</div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes textPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default BidirectionalGauge;