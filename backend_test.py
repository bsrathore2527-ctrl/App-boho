#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class RiskManagementAPITester:
    def __init__(self, base_url="https://risk-dashboard-24.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            return False

    def test_get_risk_config(self):
        """Test GET /api/risk-config"""
        try:
            response = requests.get(f"{self.api_url}/risk-config", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['daily_max_loss', 'daily_max_profit', 'max_trades_per_day', 
                                 'max_position_size', 'stop_loss_percentage', 'consecutive_loss_limit', 
                                 'cooldown_after_loss', 'trailing_profit_enabled']
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", All required fields present"
                    
            self.log_test("GET Risk Config", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("GET Risk Config", False, str(e))
            return False, {}

    def test_update_risk_config(self):
        """Test PUT /api/risk-config"""
        test_config = {
            "daily_max_loss": 3000.0,
            "daily_max_profit": 8000.0,
            "max_trades_per_day": 8,
            "max_position_size": 40000.0,
            "stop_loss_percentage": 1.5,
            "consecutive_loss_limit": 2,
            "cooldown_after_loss": 10,
            "trailing_profit_enabled": True,
            "trailing_profit_step": 0.3,
            "side_lock": "BUY"
        }
        
        try:
            response = requests.put(f"{self.api_url}/risk-config", 
                                  json=test_config, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                # Verify the update worked
                if data.get('daily_max_loss') == test_config['daily_max_loss']:
                    details += ", Config updated successfully"
                else:
                    success = False
                    details += ", Config update verification failed"
                    
            self.log_test("PUT Risk Config", success, details)
            return success
        except Exception as e:
            self.log_test("PUT Risk Config", False, str(e))
            return False

    def test_get_risk_status(self):
        """Test GET /api/risk-status"""
        try:
            response = requests.get(f"{self.api_url}/risk-status", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['current_pnl', 'trades_today', 'consecutive_losses', 
                                 'max_loss_hit', 'max_profit_hit', 'position_size']
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details += f", Missing fields: {missing_fields}"
                else:
                    details += f", All required fields present"
                    
            self.log_test("GET Risk Status", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("GET Risk Status", False, str(e))
            return False, {}

    def test_update_risk_status(self):
        """Test PUT /api/risk-status"""
        test_status = {
            "current_pnl": 1500.0,
            "trades_today": 3,
            "consecutive_losses": 1,
            "position_size": 25000.0
        }
        
        try:
            response = requests.put(f"{self.api_url}/risk-status", 
                                  json=test_status, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                # Verify the update worked
                if data.get('current_pnl') == test_status['current_pnl']:
                    details += ", Status updated successfully"
                else:
                    success = False
                    details += ", Status update verification failed"
                    
            self.log_test("PUT Risk Status", success, details)
            return success
        except Exception as e:
            self.log_test("PUT Risk Status", False, str(e))
            return False

    def test_reset_risk_status(self):
        """Test POST /api/risk-status/reset"""
        try:
            response = requests.post(f"{self.api_url}/risk-status/reset", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if "message" in data:
                    details += f", Message: {data['message']}"
                    
            self.log_test("POST Reset Risk Status", success, details)
            return success
        except Exception as e:
            self.log_test("POST Reset Risk Status", False, str(e))
            return False

    def test_get_logs(self):
        """Test GET /api/logs"""
        try:
            response = requests.get(f"{self.api_url}/logs?limit=10", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if isinstance(data, list):
                    details += f", Retrieved {len(data)} logs"
                else:
                    success = False
                    details += ", Response is not a list"
                    
            self.log_test("GET Logs", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("GET Logs", False, str(e))
            return False, []

    def test_create_log(self):
        """Test POST /api/logs"""
        test_log = {
            "level": "info",
            "type": "system",
            "message": "Test log entry from automated testing",
            "details": {"test": True, "timestamp": datetime.now().isoformat()}
        }
        
        try:
            response = requests.post(f"{self.api_url}/logs", 
                                   json=test_log, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if data.get('message') == test_log['message']:
                    details += ", Log created successfully"
                else:
                    success = False
                    details += ", Log creation verification failed"
                    
            self.log_test("POST Create Log", success, details)
            return success
        except Exception as e:
            self.log_test("POST Create Log", False, str(e))
            return False

    def test_clear_logs(self):
        """Test DELETE /api/logs"""
        try:
            response = requests.delete(f"{self.api_url}/logs", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if "message" in data:
                    details += f", Message: {data['message']}"
                    
            self.log_test("DELETE Clear Logs", success, details)
            return success
        except Exception as e:
            self.log_test("DELETE Clear Logs", False, str(e))
            return False

    def test_configuration_persistence(self):
        """Test that configuration changes persist"""
        print("\n🔄 Testing Configuration Persistence...")
        
        # Get initial config
        success1, initial_config = self.test_get_risk_config()
        if not success1:
            self.log_test("Config Persistence - Get Initial", False, "Failed to get initial config")
            return False
            
        # Update config with specific values
        test_config = {
            "daily_max_loss": 7777.0,
            "daily_max_profit": 9999.0,
            "max_trades_per_day": 15,
            "max_position_size": 55555.0,
            "stop_loss_percentage": 3.5,
            "consecutive_loss_limit": 5,
            "cooldown_after_loss": 25,
            "trailing_profit_enabled": True,
            "trailing_profit_step": 0.8,
            "side_lock": "SELL"
        }
        
        try:
            # Update config
            response = requests.put(f"{self.api_url}/risk-config", json=test_config, timeout=10)
            if response.status_code != 200:
                self.log_test("Config Persistence - Update", False, f"Update failed: {response.status_code}")
                return False
                
            # Get config again to verify persistence
            response = requests.get(f"{self.api_url}/risk-config", timeout=10)
            if response.status_code != 200:
                self.log_test("Config Persistence - Verify", False, f"Verification failed: {response.status_code}")
                return False
                
            updated_config = response.json()
            
            # Check if values persisted
            persistence_success = True
            failed_fields = []
            
            for key, expected_value in test_config.items():
                if updated_config.get(key) != expected_value:
                    persistence_success = False
                    failed_fields.append(f"{key}: expected {expected_value}, got {updated_config.get(key)}")
            
            if persistence_success:
                self.log_test("Configuration Persistence", True, "All values persisted correctly")
            else:
                self.log_test("Configuration Persistence", False, f"Failed fields: {failed_fields}")
                
            return persistence_success
            
        except Exception as e:
            self.log_test("Configuration Persistence", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Risk Management API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic API tests
        self.test_api_root()
        
        # Risk Configuration tests
        print("\n📊 Testing Risk Configuration Endpoints...")
        self.test_get_risk_config()
        self.test_update_risk_config()
        
        # Risk Status tests  
        print("\n📈 Testing Risk Status Endpoints...")
        self.test_get_risk_status()
        self.test_update_risk_status()
        self.test_reset_risk_status()
        
        # Logs tests
        print("\n📝 Testing Logs Endpoints...")
        self.test_get_logs()
        self.test_create_log()
        self.test_clear_logs()
        
        # Integration tests
        print("\n🔗 Testing Integration Scenarios...")
        self.test_configuration_persistence()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = RiskManagementAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())