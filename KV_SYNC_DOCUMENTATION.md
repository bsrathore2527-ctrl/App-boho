# KV State Sync Documentation

## Overview
The Risk Management Dashboard can sync with your existing KV (Key-Value) state from your trading system. This allows real-time updates of P&L, consecutive losses, cooldown status, and risk configurations.

## API Endpoint

### Sync KV State
**POST** `/api/sync-kv-state`

Syncs risk status and configuration from your KV state structure.

#### Request Body
```json
{
  "state": {
    "capital_day_915": 3000,
    "max_loss_pct": 5,
    "max_loss_abs": 150,
    "max_profit_pct": 10,
    "max_profit_abs": 300,
    "trail_step_profit": 150,
    "min_loss_to_count": 5000,
    "max_consecutive_losses": 3,
    "cooldown_min": 15,
    "cooldown_on_profit": false,
    "allow_new": true,
    "realised": 210,
    "unrealised": 1654,
    "total_pnl": 1864,
    "consecutive_losses": 0,
    "cooldown_active": true,
    "cooldown_until": 1765201571623,
    "tripped_day": false,
    "block_new_orders": true,
    "trip_reason": null,
    "last_trade_time": 1765200671623
  }
}
```

#### Field Mapping

| KV Field | Dashboard Field | Description |
|----------|----------------|-------------|
| `realised` | Realised P&L | Realised profit/loss |
| `unrealised` | Unrealised P&L | Unrealised profit/loss |
| `total_pnl` | Total P&L | Total profit/loss (displayed in main gauge) |
| `consecutive_losses` | Consecutive Losses | Count of consecutive losses |
| `cooldown_active` | In Cooldown | Whether cooldown is active |
| `cooldown_until` | Cooldown Until | Timestamp (milliseconds) when cooldown ends |
| `max_consecutive_losses` | Consecutive Loss Limit | Maximum allowed consecutive losses |
| `cooldown_min` | Cooldown Period | Cooldown duration in minutes |
| `max_loss_abs` | Daily Max Loss | Maximum allowed daily loss |
| `max_profit_abs` | Daily Max Profit | Maximum allowed daily profit |
| `tripped_day` | Max Loss Hit | Whether max loss has been hit |
| `trip_reason` | Violations | Reason for trip/violation |

#### Response
```json
{
  "message": "KV state synced successfully",
  "status": {
    "id": "current_status",
    "realised": 210.0,
    "unrealised": 1654.0,
    "total_pnl": 1864.0,
    "consecutive_losses": 0,
    "in_cooldown": true,
    "cooldown_remaining_minutes": 11,
    "max_loss_hit": false,
    "violations": [],
    "updated_at": "2025-12-08T14:51:40.467845+00:00"
  }
}
```

## Integration Examples

### Python Integration
```python
import requests
from datetime import datetime, timedelta

# Your KV state
kv_state = {
    "capital_day_915": 3000,
    "max_loss_pct": 5,
    "realised": 210,
    "unrealised": 1654,
    "total_pnl": 1864,
    "consecutive_losses": 0,
    "cooldown_active": True,
    "cooldown_until": int((datetime.now() + timedelta(minutes=12)).timestamp() * 1000),
    # ... other fields
}

# Sync to dashboard
response = requests.post(
    "https://your-dashboard-url/api/sync-kv-state",
    json={"state": kv_state}
)

print(response.json())
```

### JavaScript/Node.js Integration
```javascript
const axios = require('axios');

const kvState = {
  capital_day_915: 3000,
  max_loss_pct: 5,
  realised: 210,
  unrealised: 1654,
  total_pnl: 1864,
  consecutive_losses: 0,
  cooldown_active: true,
  cooldown_until: Date.now() + (12 * 60 * 1000), // 12 minutes from now
  // ... other fields
};

axios.post('https://your-dashboard-url/api/sync-kv-state', {
  state: kvState
})
.then(response => {
  console.log('Synced:', response.data);
})
.catch(error => {
  console.error('Sync failed:', error);
});
```

### Bash/Curl Integration
```bash
#!/bin/bash

DASHBOARD_URL="https://your-dashboard-url"
COOLDOWN_UNTIL=$(date -d "+12 minutes" +%s%3N)

curl -X POST "$DASHBOARD_URL/api/sync-kv-state" \\
  -H "Content-Type: application/json" \\
  -d "{
    \"state\": {
      \"realised\": 210,
      \"unrealised\": 1654,
      \"total_pnl\": 1864,
      \"consecutive_losses\": 0,
      \"cooldown_active\": true,
      \"cooldown_until\": $COOLDOWN_UNTIL,
      \"max_consecutive_losses\": 3,
      \"cooldown_min\": 15,
      \"max_loss_abs\": 150,
      \"max_profit_abs\": 300
    }
  }"
```

## Automated Sync Setup

### Periodic Sync (Recommended)
Set up a cron job or scheduled task to sync your KV state every 5 seconds:

```bash
# Crontab example (every minute, call 12 times with 5 second delay)
* * * * * for i in {1..12}; do /path/to/sync-script.sh & sleep 5; done
```

### Real-time Sync
Integrate the sync call into your trading system's state update logic:

```python
class RiskManager:
    def update_state(self, new_state):
        # Update local KV
        self.kv_state.update(new_state)
        
        # Sync to dashboard
        try:
            requests.post(
                f"{DASHBOARD_URL}/api/sync-kv-state",
                json={"state": self.kv_state},
                timeout=2
            )
        except Exception as e:
            # Log error but don't block trading
            logger.warning(f"Dashboard sync failed: {e}")
```

## Dashboard Features

### 270° Circular Gauges
- **Main P&L Gauge**: Shows total P&L with green fill for profit, red fill for loss
- **Small Gauges**: Display consecutive losses and cooldown time remaining

### Visual Elements
- Realised, Unrealised, and Total P&L displayed in the center of main gauge
- Color-coded: Green for profit, Red for loss
- Smooth animations and transitions

### Action Buttons
- **Reset Day**: Reset all status values to defaults
- **Kill All**: Kill all positions (integrate with your trading system)
- **Cancel All**: Cancel all pending orders (integrate with your trading system)
- **Configuration**: Access advanced risk parameters

### Configuration Cards
- **Set Capital**: Update trading capital
- **Min Loss to Count**: Set minimum loss threshold
- **Risk Limits**: View current max loss, max profit, and trades count

## Notes

- All timestamps should be in milliseconds (JavaScript format)
- The dashboard auto-refreshes every 5 seconds
- KV sync endpoint accepts partial state updates
- Failed syncs won't affect your trading system
- Consider implementing retry logic for production use
