import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Shield, TrendingUp, TrendingDown, Activity, Settings, AlertTriangle, CheckCircle, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configForm, setConfigForm] = useState({});

  // Fetch all data
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
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update configuration
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
      toast.success("Risk configuration updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Failed to update configuration");
    }
  };

  // Reset status
  const handleResetStatus = async () => {
    try {
      await axios.post(`${API}/risk-status/reset`);
      toast.success("Risk status reset successfully");
      fetchData();
    } catch (error) {
      console.error("Error resetting status:", error);
      toast.error("Failed to reset status");
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    try {
      await axios.delete(`${API}/logs`);
      toast.success("Logs cleared successfully");
      fetchData();
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error("Failed to clear logs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #082434 0%, #254B5A 50%, #014552 100%)' }}>
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-[#5F8BC1] mx-auto mb-4" />
          <p className="text-[#B2D7E8] text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getPnLColor = (pnl) => {
    if (pnl > 0) return "text-[#B2D7E8]";
    if (pnl < 0) return "text-[#D56F53]";
    return "text-[#99BAD7]";
  };

  const getStatusColor = () => {
    if (status?.max_loss_hit || status?.violations?.length > 0) return "status-danger";
    if (status?.consecutive_losses >= 2 || status?.in_cooldown) return "status-warning";
    return "status-good";
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #082434 0%, #254B5A 50%, #014552 100%)' }}>
      {/* Header */}
      <header className="border-b border-[#254B5A] bg-[#082434]/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#5F8BC1]" />
              <div>
                <h1 className="text-2xl font-bold text-[#B2D7E8]" style={{ fontFamily: 'Manrope, sans-serif' }}>Risk Management Dashboard</h1>
                <p className="text-sm text-[#99BAD7]">Professional Trading Discipline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`status-indicator ${getStatusColor()}`}></span>
              <span className="text-[#99BAD7] text-sm font-medium">
                {status?.max_loss_hit ? "LOCKED" : status?.in_cooldown ? "COOLDOWN" : "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card" data-testid="pnl-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#99BAD7] text-sm font-medium">Current P&L</span>
              {status?.current_pnl >= 0 ? <TrendingUp className="h-5 w-5 text-[#B2D7E8]" /> : <TrendingDown className="h-5 w-5 text-[#D56F53]" />}
            </div>
            <div className={`text-3xl font-bold ${getPnLColor(status?.current_pnl)}`}>
              ₹{status?.current_pnl?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-[#99BAD7] mt-1">
              Limit: ₹{config?.daily_max_loss?.toLocaleString()} / ₹{config?.daily_max_profit?.toLocaleString()}
            </div>
          </div>

          <div className="metric-card" data-testid="trades-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#99BAD7] text-sm font-medium">Trades Today</span>
              <Activity className="h-5 w-5 text-[#E4AD75]" />
            </div>
            <div className="text-3xl font-bold text-[#E4AD75]">
              {status?.trades_today || 0}
            </div>
            <div className="text-xs text-[#99BAD7] mt-1">
              Max: {config?.max_trades_per_day}
            </div>
          </div>

          <div className="metric-card" data-testid="consecutive-losses-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#99BAD7] text-sm font-medium">Consecutive Losses</span>
              <AlertTriangle className="h-5 w-5 text-[#D56F53]" />
            </div>
            <div className="text-3xl font-bold text-[#D56F53]">
              {status?.consecutive_losses || 0}
            </div>
            <div className="text-xs text-[#99BAD7] mt-1">
              Limit: {config?.consecutive_loss_limit}
            </div>
          </div>

          <div className="metric-card" data-testid="position-size-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#99BAD7] text-sm font-medium">Position Size</span>
              <Lock className="h-5 w-5 text-[#5F8BC1]" />
            </div>
            <div className="text-3xl font-bold text-[#5F8BC1]">
              ₹{status?.position_size?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-[#99BAD7] mt-1">
              Max: ₹{config?.max_position_size?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Violations Alert */}
        {status?.violations?.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border-2 border-[#D56F53] bg-[#D56F53]/10" data-testid="violations-alert">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-[#D56F53]" />
              <h3 className="text-lg font-bold text-[#D56F53]">Active Violations</h3>
            </div>
            <ul className="list-disc list-inside text-[#B2D7E8]">
              {status.violations.map((violation, idx) => (
                <li key={idx}>{violation}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-[#082434]/50 border border-[#254B5A]" data-testid="dashboard-tabs">
            <TabsTrigger value="config" className="data-[state=active]:bg-[#5F8BC1] data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#5F8BC1] data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" data-testid="config-tab">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#B2D7E8]" style={{ fontFamily: 'Manrope, sans-serif' }}>Risk Parameters Configuration</h2>
                <Button onClick={handleResetStatus} variant="outline" className="border-[#D56F53] text-[#D56F53] hover:bg-[#D56F53] hover:text-white" data-testid="reset-status-btn">
                  Reset Status
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="daily_max_loss" className="text-[#B2D7E8]">Daily Max Loss (₹)</Label>
                  <Input
                    id="daily_max_loss"
                    type="number"
                    value={configForm.daily_max_loss || ''}
                    onChange={(e) => setConfigForm({...configForm, daily_max_loss: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-daily-max-loss"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_max_profit" className="text-[#B2D7E8]">Daily Max Profit (₹)</Label>
                  <Input
                    id="daily_max_profit"
                    type="number"
                    value={configForm.daily_max_profit || ''}
                    onChange={(e) => setConfigForm({...configForm, daily_max_profit: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-daily-max-profit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_trades_per_day" className="text-[#B2D7E8]">Max Trades Per Day</Label>
                  <Input
                    id="max_trades_per_day"
                    type="number"
                    value={configForm.max_trades_per_day || ''}
                    onChange={(e) => setConfigForm({...configForm, max_trades_per_day: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-max-trades"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_position_size" className="text-[#B2D7E8]">Max Position Size (₹)</Label>
                  <Input
                    id="max_position_size"
                    type="number"
                    value={configForm.max_position_size || ''}
                    onChange={(e) => setConfigForm({...configForm, max_position_size: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-max-position-size"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop_loss_percentage" className="text-[#B2D7E8]">Stop Loss Percentage (%)</Label>
                  <Input
                    id="stop_loss_percentage"
                    type="number"
                    step="0.1"
                    value={configForm.stop_loss_percentage || ''}
                    onChange={(e) => setConfigForm({...configForm, stop_loss_percentage: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-stop-loss"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consecutive_loss_limit" className="text-[#B2D7E8]">Consecutive Loss Limit</Label>
                  <Input
                    id="consecutive_loss_limit"
                    type="number"
                    value={configForm.consecutive_loss_limit || ''}
                    onChange={(e) => setConfigForm({...configForm, consecutive_loss_limit: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-consecutive-loss-limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown_after_loss" className="text-[#B2D7E8]">Cooldown After Loss (minutes)</Label>
                  <Input
                    id="cooldown_after_loss"
                    type="number"
                    value={configForm.cooldown_after_loss || ''}
                    onChange={(e) => setConfigForm({...configForm, cooldown_after_loss: e.target.value})}
                    className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                    data-testid="input-cooldown"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="side_lock" className="text-[#B2D7E8]">Side Lock</Label>
                  <Select 
                    value={configForm.side_lock || "none"} 
                    onValueChange={(value) => setConfigForm({...configForm, side_lock: value === "none" ? null : value})}
                  >
                    <SelectTrigger className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]" data-testid="select-side-lock">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#082434] border-[#254B5A]">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="BUY">BUY Only</SelectItem>
                      <SelectItem value="SELL">SELL Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trailing_profit" className="text-[#B2D7E8]">Enable Trailing Profit</Label>
                    <Switch
                      id="trailing_profit"
                      checked={configForm.trailing_profit_enabled === true}
                      onCheckedChange={(checked) => {
                        setConfigForm(prev => ({...prev, trailing_profit_enabled: checked}));
                      }}
                      data-testid="switch-trailing-profit"
                    />
                  </div>
                  {configForm.trailing_profit_enabled === true && (
                    <div className="space-y-2">
                      <Label htmlFor="trailing_profit_step" className="text-[#B2D7E8]">Trailing Profit Step (%)</Label>
                      <Input
                        id="trailing_profit_step"
                        type="number"
                        step="0.1"
                        value={configForm.trailing_profit_step || ''}
                        onChange={(e) => setConfigForm(prev => ({...prev, trailing_profit_step: e.target.value}))}
                        className="bg-[#082434]/50 border-[#254B5A] text-[#B2D7E8]"
                        data-testid="input-trailing-step"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleUpdateConfig} className="bg-[#5F8BC1] hover:bg-[#5F8BC1]/80 text-white px-8" data-testid="update-config-btn">
                  Update Configuration
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-[#254B5A]">
                <p className="text-sm text-[#99BAD7]">Last updated: {formatDate(config?.updated_at)}</p>
              </div>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" data-testid="logs-tab">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#B2D7E8]" style={{ fontFamily: 'Manrope, sans-serif' }}>Activity Logs</h2>
                <Button onClick={handleClearLogs} variant="outline" className="border-[#D56F53] text-[#D56F53] hover:bg-[#D56F53] hover:text-white" data-testid="clear-logs-btn">
                  Clear All Logs
                </Button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin" data-testid="logs-container">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-[#99BAD7] mx-auto mb-4 opacity-50" />
                    <p className="text-[#99BAD7]">No logs available</p>
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className={`log-entry log-${log.level}`} data-testid={`log-entry-${idx}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {log.level === 'error' && <AlertTriangle className="h-4 w-4 text-[#D56F53]" />}
                            {log.level === 'warning' && <AlertTriangle className="h-4 w-4 text-[#E4AD75]" />}
                            {log.level === 'success' && <CheckCircle className="h-4 w-4 text-[#B2D7E8]" />}
                            {log.level === 'info' && <Activity className="h-4 w-4 text-[#5F8BC1]" />}
                            <span className="text-sm font-medium text-[#B2D7E8]">{log.message}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#99BAD7]">
                            <span>{log.type}</span>
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                          {log.details && (
                            <pre className="mt-2 text-xs text-[#99BAD7] bg-[#082434]/50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;