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
import DynamicPnLGauge from "@/components/DynamicPnLGauge";
import SmallGauge270 from "@/components/SmallGauge270";
import VerticalMeter from "@/components/VerticalMeter";
import StreakMeter from "@/components/StreakMeter";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white shadow-sm">
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
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            onClick={handleResetDay}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="reset-day-btn"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Day
          </Button>
          <Button 
            onClick={handleKill}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="kill-btn"
          >
            <Square className="h-4 w-4 mr-2" />
            Kill All
          </Button>
          <Button 
            onClick={handleCancelAll}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            data-testid="cancel-all-btn"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel All
          </Button>
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            data-testid="config-btn"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex justify-center items-center bg-white rounded-2xl shadow-lg p-8 border border-orange-100" data-testid="main-pnl-gauge">
            <DynamicPnLGauge
              realised={status?.realised || 0}
              unrealised={status?.unrealised || 0}
              total={status?.total_pnl || 0}
              maxLoss={config?.daily_max_loss || 500}
              maxProfit={config?.daily_max_profit || 500}
              trailStep={config?.trailing_profit_step || 250}
              size={440}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 flex items-center justify-center" data-testid="losses-gauge">
              <SmallGauge270
                value={status?.consecutive_losses || 0}
                max={config?.consecutive_loss_limit || 3}
                label="Consecutive Losses"
                size={160}
                isDanger={true}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 flex items-center justify-center" data-testid="cooldown-gauge">
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
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

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Risk Limits Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-xs text-gray-600 mb-1">Max Loss</div>
              <div className="text-lg font-bold text-red-600">₹{config?.daily_max_loss?.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-xs text-gray-600 mb-1">Max Profit</div>
              <div className="text-lg font-bold text-green-600">₹{config?.daily_max_profit?.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <div className="text-xs text-gray-600 mb-1">Trades Today</div>
              <div className="text-lg font-bold text-orange-600">{status?.trades_today || 0} / {config?.max_trades_per_day}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-xs text-gray-600 mb-1">Status</div>
              <div className="text-lg font-bold" style={{ color: status?.max_loss_hit ? '#ef4444' : '#10b981' }}>
                {status?.max_loss_hit ? 'LOCKED' : status?.in_cooldown ? 'COOLDOWN' : 'ACTIVE'}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-gray-100" data-testid="dashboard-tabs">
            <TabsTrigger value="config" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Advanced Config
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" data-testid="config-tab">
            <Card>
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
                    <Label>Trail Step Amount (₹)</Label>
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
                      <Label>Enable Trailing Profit</Label>
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

          <TabsContent value="logs" data-testid="logs-tab">
            <Card>
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
      </div>
    </div>
  );
};

export default Dashboard;