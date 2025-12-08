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
import CircularGauge270 from "@/components/CircularGauge270";
import SmallGauge270 from "@/components/SmallGauge270";
import VerticalMeter from "@/components/VerticalMeter";
import StreakMeter from "@/components/StreakMeter";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configForm, setConfigForm] = useState({});
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
      const [configRes, statusRes, logsRes, tradesRes] = await Promise.all([
        axios.get(`${API}/risk-config`),
        axios.get(`${API}/risk-status`),
        axios.get(`${API}/logs?limit=50`),
        axios.get(`${API}/trades?limit=100`)
      ]);
      setConfig(configRes.data);
      setStatus(statusRes.data);
      setLogs(logsRes.data);
      setTrades(tradesRes.data);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <header className="border-b border-white/20 bg-white/60 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>BOHO Risk Manager</h1>
                <p className="text-sm text-gray-500">Professional Trading Discipline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex justify-center items-center bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 hover:shadow-orange-200/50 transition-all duration-300" data-testid="main-pnl-gauge">
            <CircularGauge270
              realised={status?.realised || 0}
              unrealised={status?.unrealised || 0}
              total={status?.total_pnl || 0}
              maxLoss={config?.daily_max_loss || 5000}
              maxProfit={config?.daily_max_profit || 5000}
              size={380}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-white/60 flex items-center justify-center hover:shadow-orange-200/50 transition-all duration-300" data-testid="losses-gauge">
              <SmallGauge270
                value={status?.consecutive_losses || 0}
                max={config?.consecutive_loss_limit || 3}
                label="Consecutive Losses"
                size={160}
                isDanger={true}
              />
            </div>
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-white/60 flex items-center justify-center hover:shadow-orange-200/50 transition-all duration-300" data-testid="cooldown-gauge">
              <SmallGauge270
                value={status?.cooldown_remaining_minutes || 0}
                max={config?.cooldown_after_loss || 15}
                label="Cooldown (mins)"
                size={160}
                isDanger={false}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60 hover:shadow-orange-200/50 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-6 text-gray-700">Performance Metrics</h3>
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
          
          <StreakMeter trades={tradeHistory} maxDisplay={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60 hover:shadow-orange-200/50 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-4 rounded-xl bg-green-50/50 backdrop-blur-sm">
                <div className="text-xs text-gray-600 mb-1">Peak Profit</div>
                <div className="text-lg font-bold text-green-600">₹{status?.peak_profit?.toLocaleString() || '0'}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-50/50 backdrop-blur-sm">
                <div className="text-xs text-gray-600 mb-1">Active Loss Floor</div>
                <div className="text-lg font-bold text-blue-600">₹{status?.active_loss_floor?.toLocaleString() || '0'}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50/50 backdrop-blur-sm">
                <div className="text-xs text-gray-600 mb-1">Remaining to Max Loss</div>
                <div className="text-lg font-bold text-red-600">
                  ₹{((config?.daily_max_loss || 0) - Math.abs(status?.total_pnl || 0) < 0 ? 0 : (config?.daily_max_loss || 0) + (status?.total_pnl || 0)).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50/50 backdrop-blur-sm">
                <div className="text-xs text-gray-600 mb-1">Last Trade Time</div>
                <div className="text-sm font-bold text-purple-600">
                  {status?.last_trade_time 
                    ? new Date(status.last_trade_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60 hover:shadow-orange-200/50 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Trading Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 rounded-xl bg-blue-50/50 backdrop-blur-sm flex flex-col justify-center min-h-[80px]">
                <div className="text-xs text-gray-600 mb-2">Status</div>
                <div className="text-base font-bold leading-tight" style={{ color: status?.max_loss_hit || status?.trip_reason ? '#ef4444' : '#10b981' }}>
                  {status?.max_loss_hit || status?.trip_reason ? 'TRIPPED' : 'ACTIVE'}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50/50 backdrop-blur-sm flex flex-col justify-center min-h-[80px]">
                <div className="text-xs text-gray-600 mb-2">New Orders</div>
                <div className="text-base font-bold leading-tight break-words" style={{ color: status?.orders_allowed ? '#10b981' : '#ef4444' }}>
                  {status?.orders_allowed ? 'ALLOWED' : 'NOT ALLOWED'}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50/50 backdrop-blur-sm flex flex-col justify-center min-h-[80px]">
                <div className="text-xs text-gray-600 mb-2">Trip Reason</div>
                <div className="text-sm font-bold text-gray-700 leading-tight break-words">
                  {status?.trip_reason || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg" data-testid="dashboard-tabs">
            <TabsTrigger value="config" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Advanced Config
            </TabsTrigger>
            <TabsTrigger value="tradebook" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Tradebook
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" data-testid="config-tab">
            <Card className="bg-white/40 backdrop-blur-xl border-white/60 shadow-2xl">
              <CardHeader>
                <CardTitle>Advanced Risk Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Set Capital (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.max_position_size || ''}
                      onChange={(e) => setConfigForm({...configForm, max_position_size: e.target.value})}
                      data-testid="capital-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Loss to Count (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.stop_loss_percentage || ''}
                      onChange={(e) => setConfigForm({...configForm, stop_loss_percentage: e.target.value})}
                      data-testid="min-loss-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Max Loss (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.daily_max_loss || ''}
                      onChange={(e) => setConfigForm({...configForm, daily_max_loss: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Max Profit (₹)</Label>
                    <Input
                      type="number"
                      value={configForm.daily_max_profit || ''}
                      onChange={(e) => setConfigForm({...configForm, daily_max_profit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cooldown after Profitable Trade (mins)</Label>
                    <Input
                      type="number"
                      value={configForm.trailing_profit_step || ''}
                      onChange={(e) => setConfigForm({...configForm, trailing_profit_step: e.target.value})}
                      data-testid="trail-step-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Trades Per Day</Label>
                    <Input
                      type="number"
                      value={configForm.max_trades_per_day || ''}
                      onChange={(e) => setConfigForm({...configForm, max_trades_per_day: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consecutive Loss Limit</Label>
                    <Input
                      type="number"
                      value={configForm.consecutive_loss_limit || ''}
                      onChange={(e) => setConfigForm({...configForm, consecutive_loss_limit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cooldown Period (minutes)</Label>
                    <Input
                      type="number"
                      value={configForm.cooldown_after_loss || ''}
                      onChange={(e) => setConfigForm({...configForm, cooldown_after_loss: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Side Lock</Label>
                    <Select 
                      value={configForm.side_lock || "none"} 
                      onValueChange={(value) => setConfigForm({...configForm, side_lock: value === "none" ? null : value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                      <Label>Enable Cooldown after Profitable Trade</Label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={handleUpdateConfig} className="bg-orange-500 hover:bg-orange-600">
                    Save All Configuration
                  </Button>
                  <Button onClick={() => fetchData()} variant="outline">
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tradebook" data-testid="tradebook-tab">
            <Card className="bg-white/40 backdrop-blur-xl border-white/60 shadow-2xl">
              <CardHeader>
                <CardTitle>Trade Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {trades.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No trades available</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Instrument</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Side</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.map((trade, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-gray-900 font-medium">{trade.instrument}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                trade.side === 'BUY' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {trade.side}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-700">{trade.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-900 font-medium">₹{trade.price.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-600 text-xs">
                              {new Date(trade.timestamp).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit',
                                hour12: false 
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" data-testid="logs-tab">
            <Card className="bg-white/40 backdrop-blur-xl border-white/60 shadow-2xl">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No logs available</p>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="p-3 border-l-4 rounded" style={{ borderLeftColor: log.level === 'error' ? '#ef4444' : '#10b981', backgroundColor: '#f9fafb' }}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{log.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
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

        {/* Action Buttons at Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={handleResetDay}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              data-testid="reset-day-btn"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Day
            </Button>
            <Button 
              onClick={handleKill}
              className="bg-red-600 hover:bg-red-700 text-white px-8"
              data-testid="kill-btn"
            >
              <Square className="h-4 w-4 mr-2" />
              Kill All
            </Button>
            <Button 
              onClick={handleCancelAll}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
              data-testid="cancel-all-btn"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;