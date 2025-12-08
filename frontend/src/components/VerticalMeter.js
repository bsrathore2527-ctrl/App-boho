import React from 'react';

const VerticalMeter = ({ 
  value = 0,
  max = 100,
  label = '',
  warningThreshold = 70,
  size = 200
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isWarning = percentage >= warningThreshold;
  
  const height = size;
  const width = 60;
  const fillHeight = (percentage / 100) * (height - 40);
  
  return (
    <div className="flex flex-col items-center" style={{ width: width + 40 }}>
      <div className="relative" style={{ width, height }}>
        {/* Background bar */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{{
            width: 24,
            height: height - 40,
            background: '#f3f4f6',
            borderRadius: 12
          }}
        />
        
        {/* Fill bar - fixed to start from bottom */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-1000"
          style={{
            width: 24,
            height: fillHeight,
            background: isWarning ? 'linear-gradient(to top, #ef4444, #fca5a5)' : 'linear-gradient(to top, #10b981, #6ee7b7)',
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        />
        
        {/* Value display */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold" style={{ color: isWarning ? '#ef4444' : '#10b981' }}>
            {value}
          </div>
        </div>
        
        {/* Max label */}
        <div className="absolute top-8 -right-8 text-xs text-gray-400">
          {max}
        </div>
        
        {/* Min label */}
        <div className="absolute bottom-0 -right-6 text-xs text-gray-400">
          0
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-600 uppercase text-center">
        {label}
      </div>
    </div>
  );
};

export default VerticalMeter;