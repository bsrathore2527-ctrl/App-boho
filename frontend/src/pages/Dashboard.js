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
  const [loading, setLoading] = useState(true);
  const [configForm, setConfigForm] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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
      {/* Header */}
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
        {/* Action Buttons */}
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

        {/* Gauges Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main P&L Gauge */}
          <div className="lg:col-span-2 flex justify-center items-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100" data-testid="main-pnl-gauge">
            <CircularGauge270
              realised={status?.realised || 0}
              unrealised={status?.unrealised || 0}
              total={status?.total_pnl || 0}
              maxLoss={config?.daily_max_loss || 5000}
              maxProfit={config?.daily_max_profit || 10000}
              size={380}
            />
          </div>
          
          {/* Small Gauges */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" data-testid="losses-gauge">
              <SmallGauge270
                value={status?.consecutive_losses || 0}
                max={config?.consecutive_loss_limit || 3}
                label="Consecutive Losses"
                size={180}
                isDanger={true}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" data-testid="cooldown-gauge">
              <SmallGauge270
                value={status?.cooldown_remaining_minutes || 0}
                max={config?.cooldown_after_loss || 15}
                label="Cooldown (mins)"
                size={180}
                isDanger={false}
              />
            </div>
          </div>
        </div>

        {/* Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
                Set Capital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={configForm.max_position_size || ''}
                onChange={(e) => setConfigForm({...configForm, max_position_size: e.target.value})}
                className="mb-2"
                placeholder="Enter capital"
                data-testid="capital-input"
              />
              <Button onClick={handleUpdateConfig} className="w-full bg-orange-500 hover:bg-orange-600" size="sm">
                Update Capital
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Min Loss to Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={configForm.stop_loss_percentage || ''}
                onChange={(e) => setConfigForm({...configForm, stop_loss_percentage: e.target.value})}
                className="mb-2"
                placeholder="Enter min loss %"
                data-testid="min-loss-input"
              />
              <Button onClick={handleUpdateConfig} className="w-full bg-orange-500 hover:bg-orange-600" size="sm">
                Update Min Loss
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg">Risk Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Max Loss:</span>
                <span className="font-semibold text-red-600">₹{config?.daily_max_loss?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Profit:</span>
                <span className="font-semibold text-green-600">₹{config?.daily_max_profit?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trades Today:</span>
                <span className="font-semibold">{status?.trades_today || 0} / {config?.max_trades_per_day}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Configuration */}
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
                <CardTitle>Risk Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
                <div className="mt-6">
                  <Button onClick={handleUpdateConfig} className="bg-orange-500 hover:bg-orange-600">
                    Save Configuration
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