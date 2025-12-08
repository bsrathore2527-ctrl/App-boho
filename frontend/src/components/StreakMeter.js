import React from 'react';

const StreakMeter = ({ 
  trades = [],
  maxDisplay = 20
}) => {
  // trades array: [{type: 'profit', amount: 100}, {type: 'loss', amount: -50}, ...]
  const displayTrades = trades.slice(-maxDisplay);
  
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60 hover:shadow-orange-200/50 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Win/Loss Streak</h3>
      <div className="flex items-center gap-2 flex-wrap">
        {displayTrades.length === 0 ? (
          <span className="text-gray-400 text-sm">No trades yet</span>
        ) : (
          displayTrades.map((trade, idx) => (
            <div
              key={idx}
              className="w-3 h-3 rounded-full transition-all hover:scale-150"
              style={{
                backgroundColor: trade.type === 'profit' ? '#10b981' : '#ef4444',
                boxShadow: `0 2px 4px ${trade.type === 'profit' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                cursor: 'pointer'
              }}
              title={`${trade.type === 'profit' ? 'Profit' : 'Loss'}: ₹${Math.abs(trade.amount)}`}
            />
          ))
        )}
      </div>
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Profit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>Loss</span>
        </div>
        <span className="font-medium">{displayTrades.length} / {maxDisplay} shown</span>
      </div>
    </div>
  );
};

export default StreakMeter;