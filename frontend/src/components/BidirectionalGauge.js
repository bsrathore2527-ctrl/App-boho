import React, { useEffect, useState } from 'react';
import './BidirectionalGauge.css';

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
  
  const lossArc = (maxLoss / (maxLoss + maxProfit)) * totalDegrees;
  const profitArc = (maxProfit / (maxLoss + maxProfit)) * totalDegrees;
  
  const centerAngle = -90;
  const lossStartAngle = centerAngle - lossArc;
  const lossEndAngle = centerAngle;
  const profitStartAngle = centerAngle;
  const profitEndAngle = centerAngle + profitArc;
  
  const radius = size / 2 - 50;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 32;
  
  // Orange theme colors
  const colors = {
    light: {
      loss: '#ef4444',
      profit: '#10b981',
      lossGlow: 'rgba(239, 68, 68, 0.6)',
      profitGlow: 'rgba(16, 185, 129, 0.6)',
      bg: '#f3f4f6',
      text: '#1f2937',
      textMuted: '#6b7280',
      track: '#e5e7eb',
      accent: '#f97316'
    },
    dark: {
      loss: '#ef4444',
      profit: '#10b981',
      lossGlow: 'rgba(239, 68, 68, 0.8)',
      profitGlow: 'rgba(16, 185, 129, 0.8)',
      bg: '#0a0a0f',
      text: '#f97316',
      textMuted: '#9ca3af',
      track: '#1a1a2e',
      accent: '#f97316'
    }
  };
  
  const theme = isDark ? colors.dark : colors.light;
  
  const isProfit = total >= 0;
  const absTotal = Math.abs(total);
  const maxValue = isProfit ? maxProfit : maxLoss;
  const percentage = Math.min((absTotal / maxValue) * 100, 100);
  
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
      className="relative flex items-center justify-center bidirectional-gauge" 
      style={{ 
        width: size, 
        height: size,
        background: isDark ? 'radial-gradient(circle, #1a1a2e 0%, #0a0a0f 100%)' : 'radial-gradient(circle, #ffffff 0%, #f9fafb 100%)',
        borderRadius: '50%',
        boxShadow: isDark 
          ? '0 0 40px rgba(249, 115, 22, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)'
          : '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 0 40px rgba(0, 0, 0, 0.05)'
      }}
    >
      <svg width={size} height={size} className="transform rotate-0">
        <defs>
          <linearGradient id="loss-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: theme.loss, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: theme.loss, stopOpacity: 1 }} />
          </linearGradient>
          
          <linearGradient id="profit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: theme.profit, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: theme.profit, stopOpacity: 0.6 }} />
          </linearGradient>
          
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
        </defs>
        
        <path
          d={describeArc(centerX, centerY, radius, lossStartAngle, lossEndAngle)}
          fill="none"
          stroke={theme.track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
        />
        
        <path
          d={describeArc(centerX, centerY, radius, profitStartAngle, profitEndAngle)}
          fill="none"
          stroke={theme.track}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {generateStepMarks(true)}
        {generateStepMarks(false)}
        
        <circle
          cx={polarToCartesian(centerX, centerY, radius, centerAngle).x}
          cy={polarToCartesian(centerX, centerY, radius, centerAngle).y}
          r="6"
          fill={theme.accent}
          opacity="0.8"
        />
        
        {isProfit ? (
          <path
            d={describeArc(centerX, centerY, radius, profitStartAngle, fillAngle)}
            fill="none"
            stroke="url(#profit-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#profit-glow)"
            className="gauge-arc"
          />
        ) : (
          <path
            d={describeArc(centerX, centerY, radius, fillAngle, lossEndAngle)}
            fill="none"
            stroke="url(#loss-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#loss-glow)"
            className="gauge-arc"
          />
        )}
        
        <text
          x={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, lossStartAngle).x}
          y={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, lossStartAngle).y}
          fill={theme.loss}
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
        >
          -₹{maxLoss}
        </text>
        
        <text
          x={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, profitEndAngle).x}
          y={polarToCartesian(centerX, centerY, radius + strokeWidth/2 + 40, profitEndAngle).y}
          fill={theme.profit}
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
        >
          +₹{maxProfit}
        </text>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div 
            className="text-6xl font-bold mb-3" 
            style={{ 
              color: isProfit ? theme.profit : theme.loss,
              fontFamily: 'Manrope, sans-serif',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
                style={{ color: realised >= 0 ? theme.profit : theme.loss }}
              >
                {realised >= 0 ? '+' : ''}₹{realised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>Realised</div>
            </div>
            <div className="text-center">
              <div 
                className="font-bold text-lg"
                style={{ color: unrealised >= 0 ? theme.profit : theme.loss }}
              >
                {unrealised >= 0 ? '+' : ''}₹{unrealised.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>Unrealised</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidirectionalGauge;