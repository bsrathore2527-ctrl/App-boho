# BOHO Risk Management Dashboard - Features Documentation

## Overview
A comprehensive risk management dashboard for stock market trading with beautiful 270° circular gauges, performance metrics, and real-time monitoring capabilities.

## Key Features

### 1. 270° Circular Gauges

#### Main P&L Gauge
- **Design**: 270° circular gauge with gradient fill
- **Colors**: 
  - Green (#10b981) for profit
  - Red (#ef4444) for loss
- **Display Elements**:
  - Total P&L in center (large font)
  - Realised P&L (below total)
  - Unrealised P&L (below total)
  - Max Loss indicator on left side (-₹5,000)
  - Max Profit indicator on right side (+₹10,000)
- **Animation**: Smooth 1.5s cubic-bezier transition
- **Size**: 380px (desktop), responsive on mobile

#### Small Gauges (Side by Side)
1. **Consecutive Losses Gauge**
   - Red theme (#ef4444)
   - Shows current consecutive losses
   - Max limit displayed
   - 160px size

2. **Cooldown Gauge**
   - Green theme (#10b981)
   - Shows remaining cooldown time in minutes
   - Max cooldown period displayed
   - 160px size

**Mobile Responsive**: Both gauges display in one row (grid-cols-2) on mobile devices

### 2. Performance Metrics (Vertical Meters)

#### Three Vertical Meters Display:
1. **Number of Trades**
   - Shows current trades vs max trades per day
   - Warning threshold at 80%
   - Green fill for normal, Red for warning

2. **Win Streak**
   - Tracks consecutive winning trades
   - Max 10 streak display
   - Encourages positive trading behavior

3. **Impulsiveness Meter**
   - Measures trading discipline
   - Lower values indicate better discipline
   - Warning threshold at 60%

**Design**:
- Vertical bar meters (180px height)
- Gradient fills (green to light green, red to light red)
- Value displayed at top
- Max/Min labels on sides
- Animated fill transitions

### 3. Win/Loss Streak Meter (Horizontal)

**Features**:
- Visual representation of trade history
- Colored dots: ● Green for profit, ● Red for loss
- Displays up to 20 recent trades
- Hover to see trade details (profit/loss amount)
- Legend showing Profit/Loss indicators
- Count of displayed trades (e.g., "8 / 20 shown")

**Interaction**:
- Dots scale up 150% on hover
- Tooltip shows trade type and amount
- Smooth transitions and shadows

### 4. Action Buttons (Top Row)

1. **Reset Day** (Blue)
   - Resets all daily status values
   - Icon: RotateCcw
   - API: POST /api/risk-status/reset

2. **Kill All** (Red)
   - Kills all open positions
   - Icon: Square
   - For integration with trading system

3. **Cancel All** (Yellow)
   - Cancels all pending orders
   - Icon: XCircle
   - For integration with trading system

4. **Configuration** (Gray)
   - Opens configuration modal/section
   - Icon: Settings

5. **Login** (Orange - Header)
   - User authentication
   - Icon: User

### 5. Advanced Risk Configuration

Consolidated all configuration options in one place:

**Fields**:
1. **Set Capital (₹)** - Trading capital amount
2. **Min Loss to Count (₹)** - Minimum loss threshold to count as a losing trade
3. **Daily Max Loss (₹)** - Maximum allowed daily loss
4. **Daily Max Profit (₹)** - Maximum allowed daily profit
5. **Trail Step Amount (₹)** - Amount for trailing profit steps
6. **Max Trades Per Day** - Maximum number of trades allowed
7. **Consecutive Loss Limit** - Maximum consecutive losses before lockout
8. **Cooldown Period (minutes)** - Cooldown duration after loss limit
9. **Side Lock** - Dropdown: None / BUY Only / SELL Only
10. **Enable Trailing Profit** - Toggle switch

**Actions**:
- Save All Configuration button
- Refresh button to reload data

### 6. Risk Limits Summary

**Display Cards**:
1. **Max Loss** (Red background)
   - Shows daily max loss limit
   - Red text for emphasis

2. **Max Profit** (Green background)
   - Shows daily max profit target
   - Green text for positive indication

3. **Trades Today** (Orange background)
   - Current trades / Max trades
   - Orange text for activity indicator

4. **Status** (Blue background)
   - ACTIVE (green) - Normal trading
   - COOLDOWN (cyan) - In cooldown period
   - LOCKED (red) - Max loss hit, trading disabled

### 7. KV State Sync Integration

**Endpoint**: POST `/api/sync-kv-state`

**Synced Fields**:
- realised, unrealised, total_pnl
- consecutive_losses
- cooldown_active, cooldown_until, cooldown_remaining_minutes
- max_consecutive_losses, cooldown_min
- max_loss_abs, max_profit_abs
- capital_day_915
- trail_step_profit

**Auto-Refresh**: Dashboard refreshes every 5 seconds

### 8. Design Theme (BOHO Style)

**Colors**:
- Primary: Orange (#f97316)
- Success/Profit: Green (#10b981)
- Danger/Loss: Red (#ef4444)
- Warning: Yellow (#eab308)
- Info: Blue (#3b82f6)
- Background: White (#ffffff)
- Text: Gray scale (#1f2937, #6b7280, #9ca3af)

**Typography**:
- Headings: Manrope (sans-serif)
- Body: Inter (sans-serif)
- Font sizes: Responsive (text-sm to text-5xl)

**Components**:
- Rounded corners (rounded-xl, rounded-2xl)
- Shadows (shadow-lg)
- Borders (border-gray-100, border-orange-200)
- Smooth transitions
- Glass-morphism effects

### 9. Responsive Design

**Breakpoints**:
- Mobile: < 768px (sm)
- Tablet: 768px - 1024px (md)
- Desktop: > 1024px (lg)

**Adaptive Layout**:
- Main gauge: Full width on mobile, 2/3 width on desktop
- Small gauges: 2 columns (side by side) on all devices
- Vertical meters: Stacked on mobile, side by side on desktop
- Configuration: Single column on mobile, 2 columns on desktop

### 10. Logs and Activity Tracking

**Log Types**:
- CONFIG_CHANGE - Configuration updates
- RISK_EVENT - Risk-related events
- VIOLATION - Rule violations
- SYSTEM - System events

**Log Levels**:
- INFO (blue) - Informational messages
- WARNING (yellow) - Warning messages
- ERROR (red) - Error messages
- SUCCESS (green) - Success messages

**Display**:
- Sorted by timestamp (newest first)
- Color-coded left border
- Expandable details section
- Clear all logs button

## API Endpoints

### Configuration
- GET `/api/risk-config` - Get current configuration
- PUT `/api/risk-config` - Update configuration

### Status
- GET `/api/risk-status` - Get current status
- PUT `/api/risk-status` - Update status
- POST `/api/risk-status/reset` - Reset daily status

### Logs
- GET `/api/logs?limit=50` - Get logs
- POST `/api/logs` - Create log entry
- DELETE `/api/logs` - Clear all logs

### KV Sync
- POST `/api/sync-kv-state` - Sync from KV state

## Usage Examples

### Update Trade History
```javascript
// Add a new trade to the streak meter
const newTrade = {
  type: tradeProfit > 0 ? 'profit' : 'loss',
  amount: tradeProfit
};
setTradeHistory(prev => [...prev, newTrade]);
```

### Sync from Trading System
```python
import requests

# Your trading system state
state = {
    "realised": 210,
    "unrealised": 1654,
    "total_pnl": 1864,
    "consecutive_losses": 0,
    "cooldown_active": True,
    "cooldown_until": int(datetime.now().timestamp() * 1000),
    # ... other fields
}

# Sync to dashboard
response = requests.post(
    "https://your-dashboard-url/api/sync-kv-state",
    json={"state": state}
)
```

## Best Practices

1. **Real-time Updates**: Sync KV state every 5 seconds for real-time monitoring
2. **Error Handling**: Dashboard continues working even if sync fails
3. **Mobile Testing**: Test on actual mobile devices for touch interactions
4. **Color Consistency**: Use BOHO color scheme throughout custom components
5. **Accessibility**: Ensure sufficient color contrast for visually impaired users
6. **Performance**: Optimize animations for smooth 60fps rendering
7. **Data Validation**: Validate all inputs before saving configuration
8. **Backup**: Keep backup of previous day's configuration

## Future Enhancements

- Real-time WebSocket integration for live updates
- Trading journal with detailed trade analysis
- Performance analytics and reports
- Multi-day historical data visualization
- Mobile app version
- Advanced charting and technical indicators
- Alert notifications (email, SMS, push)
- Multi-user support with roles and permissions
