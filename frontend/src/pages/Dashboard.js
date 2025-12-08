import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Shield, User, Settings, RotateCcw, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BidirectionalGauge from "@/components/BidirectionalGauge";
import SmallGauge270 from "@/components/SmallGauge270";
import VerticalMeter from "@/components/VerticalMeter";
import StreakMeter from "@/components/StreakMeter";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const THEME = process.env.REACT_APP_THEME || 'light';

const Dashboard = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configForm, setConfigForm] = useState({});
  const [isDarkTheme, setIsDarkTheme] = useState(THEME === 'dark');
  const [tradeHistory, setTradeHistory] = useState([
    { type: 'profit', amount: 150 },
    { type: 'profit', amount: 200 },
    { type: 'loss', amount: -50 },
    { type: 'profit', amount: 300 },
    { type: 'loss', amount: -100 },
    { type: 'profit', amount: 180 },
    { type: 'profit', amount: 250 },
    { type: 'loss', amount: -75 },
  ]);

  const fetchData = async () => {
    try {
      const [configRes, statusRes, logsRes] = await Promise.all([
        axios.get(`${API}/risk-config`),
        axios.get(`${API}/risk-status`),
        axios.get(`${API}/logs?limit=50`)
      ]);
      setConfig(configRes.data);
      setStatus(statusRes.data);
      setLogs(logsRes.data);
      setConfigForm(configRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateConfig = async () => {
    try {
      const response = await axios.put(`${API}/risk-config`, {
        daily_max_loss: parseFloat(configForm.daily_max_loss),
        daily_max_profit: parseFloat(configForm.daily_max_profit),
        max_trades_per_day: parseInt(configForm.max_trades_per_day),
        max_position_size: parseFloat(configForm.max_position_size),
        stop_loss_percentage: parseFloat(configForm.stop_loss_percentage),
        consecutive_loss_limit: parseInt(configForm.consecutive_loss_limit),
        cooldown_after_loss: parseInt(configForm.cooldown_after_loss),
        trailing_profit_enabled: configForm.trailing_profit_enabled,
        trailing_profit_step: parseFloat(configForm.trailing_profit_step || 0),
        side_lock: configForm.side_lock || null
      });
      setConfig(response.data);
      toast.success("Configuration updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update configuration");
    }
  };

  const handleResetDay = async () => {
    try {
      await axios.post(`${API}/risk-status/reset`);
      toast.success("Day reset successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to reset day");
    }
  };

  const handleKill = () => {
    toast.error("Kill all positions (Feature coming soon)");
  };

  const handleCancelAll = () => {
    toast.warning("Cancel all orders (Feature coming soon)");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDarkTheme ? '#0a0a0f' : '#ffffff' }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: isDarkTheme ? '#00ff88' : '#f97316' }}
          ></div>
          <p className="text-lg" style={{ color: isDarkTheme ? '#00ff88' : '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const bgColor = isDarkTheme ? '#0a0a0f' : '#ffffff';
  const headerBg = isDarkTheme ? '#1a1a2e' : '#ffffff';
  const textColor = isDarkTheme ? '#00ff88' : '#1f2937';
  const mutedColor = isDarkTheme ? '#4a5568' : '#6b7280';
  const primaryColor = isDarkTheme ? '#00ff88' : '#f97316';

  return (
    <div className="min-h-screen" style={{ background: isDarkTheme ? 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)' : '#f9fafb' }}>
      {/* Header */}
      <header className="border-b shadow-sm" style={{ borderColor: isDarkTheme ? '#1a1a2e' : '#e5e7eb', backgroundColor: headerBg }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" style={{ color: primaryColor }} />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: textColor, fontFamily: isDarkTheme ? 'Orbitron, sans-serif' : 'Manrope, sans-serif' }}>BOHO Risk Manager</h1>
                <p className="text-sm" style={{ color: mutedColor }}>Professional Trading Discipline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                style={{ borderColor: primaryColor, color: primaryColor }}
                className="hover:bg-opacity-10"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
              >
                {isDarkTheme ? '☀️' : '🌙'} Theme
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                style={{ borderColor: primaryColor, color: primaryColor }}
                data-testid="login-btn"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            onClick={handleResetDay}
            className="text-white"
            style={{ backgroundColor: isDarkTheme ? '#0066ff' : '#3b82f6' }}
            data-testid="reset-day-btn"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Day
          </Button>
          <Button 
            onClick={handleKill}
            className="text-white"
            style={{ backgroundColor: isDarkTheme ? '#ff0844' : '#ef4444' }}
            data-testid="kill-btn"
          >
            <Square className="h-4 w-4 mr-2" />
            Kill All
          </Button>
          <Button 
            onClick={handleCancelAll}
            className="text-white"
            style={{ backgroundColor: isDarkTheme ? '#ffaa00' : '#eab308' }}
            data-testid="cancel-all-btn"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel All
          </Button>
          <Button 
            variant="outline"
            style={{ borderColor: mutedColor, color: mutedColor }}
            data-testid="config-btn"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>

        {/* Main Bidirectional Gauge */}
        <div className="flex justify-center items-center mb-8" data-testid="main-gauge">
          <BidirectionalGauge
            realised={status?.realised || 0}
            unrealised={status?.unrealised || 0}
            total={status?.total_pnl || 0}
            maxLoss={config?.daily_max_loss || 500}
            maxProfit={config?.daily_max_profit || 500}
            trailStep={config?.trailing_profit_step || 250}
            size={480}
            isDark={isDarkTheme}
          />
        </div>

        {/* Small Gauges */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="rounded-2xl shadow-lg p-4 border flex items-center justify-center" style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }} data-testid="losses-gauge">
            <SmallGauge270
              value={status?.consecutive_losses || 0}
              max={config?.consecutive_loss_limit || 3}
              label="Consecutive Losses"
              size={160}
              isDanger={true}
            />
          </div>
          <div className="rounded-2xl shadow-lg p-4 border flex items-center justify-center" style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }} data-testid="cooldown-gauge">
            <SmallGauge270
              value={status?.cooldown_remaining_minutes || 0}
              max={config?.cooldown_after_loss || 15}
              label="Cooldown (mins)"
              size={160}
              isDanger={false}
            />
          </div>
        </div>

        {/* Vertical Meters and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl shadow-lg p-6 border" style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: textColor }}>Performance Metrics</h3>
            <div className="flex justify-around items-end">
              <VerticalMeter
                value={status?.trades_today || 0}
                max={config?.max_trades_per_day || 10}
                label="No. of Trades"
                warningThreshold={80}
                size={180}
              />
              <VerticalMeter
                value={5}
                max={10}
                label="Win Streak"
                warningThreshold={90}
                size={180}
              />
              <VerticalMeter
                value={2}
                max={10}
                label="Impulsiveness"
                warningThreshold={60}
                size={180}
              />
            </div>
          </div>
          
          <div style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }}>
            <StreakMeter trades={tradeHistory} maxDisplay={20} />
          </div>
        </div>

        {/* Risk Summary */}
        <div className="rounded-2xl shadow-lg p-6 border mb-8" style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>Risk Limits Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 8, 68, 0.1)' : '#fef2f2' }}>
              <div className="text-xs mb-1" style={{ color: mutedColor }}>Max Loss</div>
              <div className="text-lg font-bold" style={{ color: isDarkTheme ? '#ff0844' : '#ef4444' }}>₹{config?.daily_max_loss?.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: isDarkTheme ? 'rgba(0, 255, 136, 0.1)' : '#f0fdf4' }}>
              <div className="text-xs mb-1" style={{ color: mutedColor }}>Max Profit</div>
              <div className="text-lg font-bold" style={{ color: isDarkTheme ? '#00ff88' : '#10b981' }}>₹{config?.daily_max_profit?.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 170, 0, 0.1)' : '#fef3c7' }}>
              <div className="text-xs mb-1" style={{ color: mutedColor }}>Trades Today</div>
              <div className="text-lg font-bold" style={{ color: isDarkTheme ? '#ffaa00' : '#f59e0b' }}>{status?.trades_today || 0} / {config?.max_trades_per_day}</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: isDarkTheme ? 'rgba(0, 102, 255, 0.1)' : '#eff6ff' }}>
              <div className="text-xs mb-1" style={{ color: mutedColor }}>Status</div>
              <div className="text-lg font-bold" style={{ color: status?.max_loss_hit ? (isDarkTheme ? '#ff0844' : '#ef4444') : (isDarkTheme ? '#00ff88' : '#10b981') }}>
                {status?.max_loss_hit ? 'LOCKED' : status?.in_cooldown ? 'COOLDOWN' : 'ACTIVE'}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#f3f4f6' }} data-testid="dashboard-tabs">
            <TabsTrigger value="config" style={{ color: textColor }}>Advanced Config</TabsTrigger>
            <TabsTrigger value="logs" style={{ color: textColor }}>Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="config" data-testid="config-tab">
            <Card style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }}>
              <CardHeader>
                <CardTitle style={{ color: textColor }}>Advanced Risk Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Set Capital (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.max_position_size || ''}
                      onChange={(e) => setConfigForm({...configForm, max_position_size: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                      data-testid="capital-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Min Loss to Count (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.stop_loss_percentage || ''}
                      onChange={(e) => setConfigForm({...configForm, stop_loss_percentage: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                      data-testid="min-loss-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Daily Max Loss (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.daily_max_loss || ''}
                      onChange={(e) => setConfigForm({...configForm, daily_max_loss: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Daily Max Profit (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.daily_max_profit || ''}
                      onChange={(e) => setConfigForm({...configForm, daily_max_profit: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Trail Step Amount (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.trailing_profit_step || ''}
                      onChange={(e) => setConfigForm({...configForm, trailing_profit_step: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                      data-testid="trail-step-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Max Trades Per Day</Label>
                    <Input
                      type="number"
                      value={configForm.max_trades_per_day || ''}
                      onChange={(e) => setConfigForm({...configForm, max_trades_per_day: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Consecutive Loss Limit</Label>
                    <Input
                      type="number"
                      value={configForm.consecutive_loss_limit || ''}
                      onChange={(e) => setConfigForm({...configForm, consecutive_loss_limit: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Cooldown Period (minutes)</Label>
                    <Input
                      type="number"
                      value={configForm.cooldown_after_loss || ''}
                      onChange={(e) => setConfigForm({...configForm, cooldown_after_loss: e.target.value})}
                      style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: textColor }}>Side Lock</Label>
                    <Select 
                      value={configForm.side_lock || "none"} 
                      onValueChange={(value) => setConfigForm({...configForm, side_lock: value === "none" ? null : value})}
                    >
                      <SelectTrigger style={{ backgroundColor: isDarkTheme ? '#0a0a0f' : '#ffffff', color: textColor, borderColor: isDarkTheme ? '#2d3748' : '#d1d5db' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff' }}>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="BUY">BUY Only</SelectItem>
                        <SelectItem value="SELL">SELL Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={configForm.trailing_profit_enabled === true}
                        onCheckedChange={(checked) => setConfigForm(prev => ({...prev, trailing_profit_enabled: checked}))}
                      />
                      <Label style={{ color: textColor }}>Enable Trailing Profit</Label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleUpdateConfig} style={{ backgroundColor: primaryColor, color: isDarkTheme ? '#0a0a0f' : '#ffffff' }}>
                    Save All Configuration
                  </Button>
                  <Button onClick={() => fetchData()} variant="outline" style={{ borderColor: mutedColor, color: mutedColor }}>
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" data-testid="logs-tab">
            <Card style={{ backgroundColor: isDarkTheme ? '#1a1a2e' : '#ffffff', borderColor: isDarkTheme ? '#2d3748' : '#e5e7eb' }}>
              <CardHeader>
                <CardTitle style={{ color: textColor }}>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-center py-8" style={{ color: mutedColor }}>No logs available</p>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="p-3 border-l-4 rounded" style={{ borderLeftColor: log.level === 'error' ? (isDarkTheme ? '#ff0844' : '#ef4444') : (isDarkTheme ? '#00ff88' : '#10b981'), backgroundColor: isDarkTheme ? '#0a0a0f' : '#f9fafb' }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm" style={{ color: textColor }}>{log.message}</p>
                            <p className="text-xs mt-1" style={{ color: mutedColor }}>{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;