# Gauge Behavior Guide - How It Works

## Main P&L Gauge (270° Circular)

### Visual Behavior Based on P&L

#### 🟢 PROFIT Scenario (total_pnl >= 0)

**Color**: Green (#10b981)

**Example**: +₹1,864 profit
```
Calculation:
- Total P&L: +₹1,864
- Max Profit: ₹10,000
- Fill Percentage: (1,864 / 10,000) * 100 = 18.64%
- Gauge fills 18.64% of the 270° arc
```

**Visual Elements**:
- ✅ Gauge arc: Bright green gradient
- ✅ Total P&L: **+₹1,864** (large, green, bold)
- ✅ Realised: **+₹210** (green)
- ✅ Unrealised: **+₹1,654** (green)
- ✅ Left label: **-₹150** (Max Loss in red)
- ✅ Right label: **+₹300** (Max Profit in green)

---

#### 🔴 LOSS Scenario (total_pnl < 0)

**Color**: Red (#ef4444)

**Example 1**: Small Loss -₹125
```
Calculation:
- Total P&L: -₹125
- Max Loss: ₹150
- Fill Percentage: (125 / 150) * 100 = 83.3%
- Gauge fills 83.3% of the 270° arc
```

**Visual Elements**:
- ❌ Gauge arc: Bright red gradient
- ❌ Total P&L: **-₹125** (large, red, bold)
- ❌ Realised: **-₹80** (red)
- ❌ Unrealised: **-₹45** (red)
- ⚠️ Consecutive Losses: **2** (red gauge)

**Example 2**: Big Loss -₹135 (90% of max)
```
Calculation:
- Total P&L: -₹135
- Max Loss: ₹150
- Fill Percentage: (135 / 150) * 100 = 90%
- Gauge fills 90% of the 270° arc (almost full!)
```

**Visual Elements**:
- ❌ Gauge arc: Nearly full red arc
- ❌ Total P&L: **-₹135** (large, red, bold)
- ❌ Consecutive Losses: **3** (red gauge, at max limit)
- ⚠️ Cooldown: **9 mins** (active, green gauge)
- 🚨 Status: **COOLDOWN** (displayed in Risk Summary)

**Example 3**: Max Loss Hit -₹150
```
Calculation:
- Total P&L: -₹150
- Max Loss: ₹150
- Fill Percentage: (150 / 150) * 100 = 100%
- Gauge completely filled (270° full arc)
```

**Visual Elements**:
- 🚫 Gauge arc: Completely filled red arc
- 🚫 Total P&L: **-₹150** (large, red, bold)
- 🚫 Status: **LOCKED** (trading disabled)
- 🚨 System blocks new orders

---

## Gauge Fill Animation

### Smooth Transitions
- **Duration**: 1.5 seconds
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Effect**: Smooth arc growth from 0 to target percentage

### Auto-Refresh Behavior
- Dashboard refreshes every **5 seconds**
- Gauge updates automatically with new P&L data
- Animation plays on each update
- No page reload required

---

## Small Gauges Behavior

### 1. Consecutive Losses Gauge

**Red Theme** (Danger indicator)

| Value | Color | Behavior |
|-------|-------|----------|
| 0 | Gray background | No losses, gauge empty |
| 1 | Light red | 33% filled (if max = 3) |
| 2 | Medium red | 67% filled |
| 3 | Dark red | 100% filled, WARNING! |

**When limit reached (3/3)**:
- Gauge completely filled with red
- Triggers cooldown period
- System may block trading depending on config

### 2. Cooldown Gauge

**Green/Cyan Theme** (Active state indicator)

| Value | Color | Behavior |
|-------|-------|----------|
| 0 min | Gray background | No cooldown, empty gauge |
| 5 min | Light green | 33% filled (if max = 15) |
| 10 min | Medium green | 67% filled |
| 15 min | Dark green | 100% filled, full cooldown |

**Cooldown Active**:
- Gauge shows remaining minutes
- Decreases over time
- Status shows "COOLDOWN"
- Trading may be restricted

---

## Color Coding System

### Primary Colors

| Metric | Profit/Positive | Loss/Negative | Neutral |
|--------|----------------|---------------|---------|
| **P&L** | Green #10b981 | Red #ef4444 | - |
| **Realised** | Green #10b981 | Red #ef4444 | - |
| **Unrealised** | Green #10b981 | Red #ef4444 | - |
| **Consecutive Losses** | - | Red #ef4444 | Gray |
| **Cooldown** | Green #10b981 | - | Gray |
| **Max Loss Label** | - | Red #ef4444 | - |
| **Max Profit Label** | Green #10b981 | - | - |

### Status Colors

| Status | Color | Code |
|--------|-------|------|
| ACTIVE | Green | #10b981 |
| COOLDOWN | Cyan | #14b8a6 |
| LOCKED | Red | #ef4444 |

---

## Real-World Examples

### Scenario 1: Profitable Day
```json
{
  "realised": 500,
  "unrealised": 300,
  "total_pnl": 800,
  "max_profit": 10000,
  "consecutive_losses": 0
}
```
- ✅ Gauge: 8% filled with GREEN
- ✅ Display: **+₹800** in green
- ✅ Consecutive Losses: 0 (empty gauge)
- ✅ Status: **ACTIVE**

### Scenario 2: Small Loss Day
```json
{
  "realised": -50,
  "unrealised": -30,
  "total_pnl": -80,
  "max_loss": 5000,
  "consecutive_losses": 1
}
```
- ⚠️ Gauge: 1.6% filled with RED
- ⚠️ Display: **-₹80** in red
- ⚠️ Consecutive Losses: 1 (33% filled, red)
- ✅ Status: **ACTIVE** (within limits)

### Scenario 3: Critical Loss
```json
{
  "realised": -4500,
  "unrealised": -400,
  "total_pnl": -4900,
  "max_loss": 5000,
  "consecutive_losses": 3,
  "cooldown_active": true,
  "cooldown_remaining_minutes": 15
}
```
- 🚨 Gauge: 98% filled with RED (almost max!)
- 🚨 Display: **-₹4,900** in red
- 🚨 Consecutive Losses: 3 (100% filled, RED)
- 🚨 Cooldown: 15 mins (100% filled, GREEN)
- ⚠️ Status: **COOLDOWN**
- ⚠️ Only ₹100 away from max loss!

### Scenario 4: Max Loss Hit
```json
{
  "realised": -5200,
  "unrealised": 0,
  "total_pnl": -5200,
  "max_loss": 5000,
  "tripped_day": true
}
```
- 🚫 Gauge: 100% filled with RED (capped at max)
- 🚫 Display: **-₹5,200** in red
- 🚫 Status: **LOCKED**
- 🚫 Trading: **DISABLED**
- 🚫 Message: "Max loss limit reached"

---

## Interactive Features

### Hover Effects
- **Streak dots**: Scale up 150% on hover, show trade details
- **Vertical meters**: Slight shadow increase
- **Gauges**: Subtle glow effect

### Responsive Behavior
- **Desktop (>1024px)**: Full 380px main gauge
- **Tablet (768-1024px)**: 320px main gauge
- **Mobile (<768px)**: 280px main gauge, small gauges side-by-side

### Auto-Update Logic
```javascript
// Updates every 5 seconds
setInterval(() => {
  fetchRiskStatus();
  // Gauge automatically animates to new values
}, 5000);
```

---

## Integration with KV State

### Sync Loss Data
```bash
curl -X POST "https://your-dashboard/api/sync-kv-state" \
  -H "Content-Type: application/json" \
  -d '{
    "state": {
      "total_pnl": -125,
      "realised": -80,
      "unrealised": -45,
      "max_loss_abs": 150,
      "consecutive_losses": 2
    }
  }'
```

**Result**:
- Gauge immediately updates with red fill
- Shows -₹125 in red text
- Consecutive losses gauge shows 2

---

## Best Practices

1. **Monitor Closely**: Watch gauge fill percentage
   - <50%: Safe zone
   - 50-80%: Caution zone
   - >80%: Danger zone - consider reducing exposure

2. **Use Color Cues**: 
   - Green = All good
   - Red = Take action

3. **Respect Cooldowns**:
   - Don't override cooldown periods
   - Use time to analyze what went wrong

4. **Set Appropriate Limits**:
   - Max Loss: 2-5% of capital
   - Max Profit: 2-3x max loss
   - Adjust based on strategy

5. **Track Streaks**:
   - Use Win/Loss streak meter to identify patterns
   - Multiple red dots = review strategy
   - Multiple green dots = validate what's working

---

## Troubleshooting

**Q: Gauge not updating?**
- Check auto-refresh is working (5-second interval)
- Verify API connection
- Check browser console for errors

**Q: Colors not changing?**
- Verify total_pnl value is correct
- Check if value crosses 0 (negative to positive)
- Refresh page

**Q: Gauge shows 100% but loss is less than max?**
- Check max_loss configuration
- Values are capped at 100%
- Verify calculation: (loss / max_loss) * 100

**Q: Animation not smooth?**
- Enable hardware acceleration in browser
- Close other resource-heavy tabs
- Check for JavaScript errors

---

## Summary

✅ **PROFIT**: Green gauge, fills based on % of max profit
❌ **LOSS**: Red gauge, fills based on % of max loss  
🎯 **LIMITS**: Clearly shown on left (max loss) and right (max profit)
⚠️ **WARNING**: Multiple visual cues when approaching limits
🚫 **LOCKED**: Complete fill + LOCKED status when max loss hit
