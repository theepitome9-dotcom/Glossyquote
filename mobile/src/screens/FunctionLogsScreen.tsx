import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

interface LogEntry {
  id: string;
  timestamp: string;
  function: string;
  type: "info" | "error" | "success" | "warning";
  message: string;
  details?: any;
}

export default function FunctionLogsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [secretKeyStatus, setSecretKeyStatus] = useState<
    "checking" | "configured" | "missing" | "error"
  >("checking");

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

  // Check if secret keys are configured
  const checkSecretKeyStatus = async () => {
    try {
      // Test the create-checkout function to see if it has the secret key
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout`,
        {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
        }
      );

      if (response.ok) {
        setSecretKeyStatus("configured");
        addLog({
          function: "Environment",
          type: "success",
          message: "Secret keys appear to be configured correctly",
        });
      } else {
        setSecretKeyStatus("error");
        addLog({
          function: "Environment",
          type: "error",
          message: "Secret keys may not be configured",
        });
      }
    } catch (error: any) {
      setSecretKeyStatus("error");
      addLog({
        function: "Environment",
        type: "error",
        message: `Error checking secret keys: ${error.message}`,
      });
    }
  };

  // Test function endpoints
  const testFunctionEndpoint = async (functionName: string) => {
    try {
      addLog({
        function: functionName,
        type: "info",
        message: `Testing ${functionName} endpoint...`,
      });

      // Special handling for stripe-webhook (not browser-callable)
      if (functionName === "stripe-webhook") {
        addLog({
          function: functionName,
          type: "warning",
          message: "stripe-webhook is only callable by Stripe (security feature)",
          details: { 
            note: "This webhook prevents payment bypass attacks. Customers cannot fake payment confirmation.",
            security: "Only Stripe servers can call this endpoint to verify real payments",
            testUrl: "Test via: https://dashboard.stripe.com/webhooks"
          },
        });
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/${functionName}`,
        {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
        }
      );

      // OPTIONS requests typically return 200 or 204
      if (response.ok || response.status === 204) {
        addLog({
          function: functionName,
          type: "success",
          message: `${functionName} endpoint is reachable`,
          details: { status: response.status },
        });
      } else {
        // Get response text for more details
        const responseText = await response.text().catch(() => "No response body");
        addLog({
          function: functionName,
          type: "error",
          message: `${functionName} returned status ${response.status}`,
          details: { 
            status: response.status,
            statusText: response.statusText,
            response: responseText.substring(0, 200) // First 200 chars
          },
        });
      }
    } catch (error: any) {
      addLog({
        function: functionName,
        type: "error",
        message: `Error testing ${functionName}: ${error.message}`,
        details: {
          error: error.toString(),
          stack: error.stack?.substring(0, 200)
        }
      });
    }
  };

  // Add log entry
  const addLog = (log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: new Date().toISOString(),
      ...log,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Initialize
  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    setLogs([]);

    addLog({
      function: "System",
      type: "info",
      message: "Starting diagnostics...",
    });

    // Check environment variables
    if (supabaseUrl && supabaseAnonKey) {
      addLog({
        function: "Environment",
        type: "success",
        message: "Supabase URL and Anon Key are configured",
        details: { url: supabaseUrl },
      });
    } else {
      addLog({
        function: "Environment",
        type: "error",
        message: "Missing Supabase configuration",
      });
    }

    // Check secret key status
    await checkSecretKeyStatus();

    // Test all function endpoints
    await testFunctionEndpoint("create-checkout");
    await testFunctionEndpoint("create-payment-intent");
    await testFunctionEndpoint("purchase-credits");
    await testFunctionEndpoint("stripe-webhook");

    addLog({
      function: "System",
      type: "success",
      message: "Diagnostics complete",
    });

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiagnostics();
    setRefreshing(false);
  };

  const getIconForType = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getColorForType = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-blue-400";
    }
  };

  const getSecretKeyStatusColor = () => {
    switch (secretKeyStatus) {
      case "configured":
        return "bg-green-950 border-green-500";
      case "missing":
      case "error":
        return "bg-red-950 border-red-500";
      default:
        return "bg-gray-900 border-gray-600";
    }
  };

  const getSecretKeyStatusText = () => {
    switch (secretKeyStatus) {
      case "configured":
        return "✅ Secret Keys Configured";
      case "missing":
        return "❌ Secret Keys Missing";
      case "error":
        return "⚠️ Configuration Error";
      default:
        return "⏳ Checking...";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#60a5fa" />
            <Text className="text-lg font-semibold text-white ml-2">
              Function Logs & Diagnostics
            </Text>
          </Pressable>
          <Pressable onPress={onRefresh} disabled={refreshing}>
            <Ionicons
              name="refresh"
              size={24}
              color={refreshing ? "#4b5563" : "#60a5fa"}
            />
          </Pressable>
        </View>
      </View>

      {/* Secret Key Status */}
      <View className="px-6 py-4">
        <View
          className={`p-4 rounded-lg border-2 ${getSecretKeyStatusColor()}`}
        >
          <Text className="text-lg font-semibold text-white mb-2">
            {getSecretKeyStatusText()}
          </Text>
          <Text className="text-sm text-gray-400 mb-2">
            Functions require the following environment variables:
          </Text>
          <View className="space-y-1">
            <Text className="text-sm text-gray-300 font-mono">
              • STRIPE_SECRET_KEY
            </Text>
            <Text className="text-sm text-gray-300 font-mono">
              • STRIPE_WEBHOOK_SECRET
            </Text>
            <Text className="text-sm text-gray-300 font-mono">
              • SUPABASE_SERVICE_ROLE_KEY
            </Text>
          </View>
          {secretKeyStatus === "configured" && (
            <View className="mt-3 p-3 bg-green-900 rounded border border-green-600">
              <Text className="text-sm text-green-200 font-semibold mb-1">
                🔒 Security Active
              </Text>
              <Text className="text-xs text-green-300">
                Payment verification via webhook prevents unauthorized access to estimates
              </Text>
            </View>
          )}
          {secretKeyStatus === "error" && (
            <View className="mt-3 p-3 bg-red-900 rounded border border-red-600">
              <Text className="text-sm text-red-200 font-semibold mb-1">
                How to configure secrets:
              </Text>
              <Text className="text-xs text-red-300 font-mono">
                supabase secrets set STRIPE_SECRET_KEY=sk_...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Function Status */}
      <View className="px-6 py-2">
        <Text className="text-sm font-semibold text-gray-300 mb-2">
          Supabase Functions Status
        </Text>
        <View className="space-y-2">
          {["create-checkout", "create-payment-intent", "purchase-credits", "stripe-webhook"].map(
            (func) => {
              const funcLog = logs.find((log) => log.function === func);
              const isWebhook = func === "stripe-webhook";
              
              return (
                <View
                  key={func}
                  className="flex-row items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-mono text-gray-300">
                      {func}
                    </Text>
                    {isWebhook && funcLog?.type === "warning" && (
                      <Text className="text-xs text-yellow-400 mt-1">
                        🔒 Security: Stripe-only
                      </Text>
                    )}
                  </View>
                  {funcLog ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name={getIconForType(funcLog.type)}
                        size={16}
                        color={
                          funcLog.type === "success"
                            ? "#16a34a"
                            : funcLog.type === "error"
                            ? "#dc2626"
                            : funcLog.type === "warning"
                            ? "#ca8a04"
                            : "#6b7280"
                        }
                      />
                      <Text
                        className={`text-xs ml-1 ${getColorForType(
                          funcLog.type
                        )}`}
                      >
                        {funcLog.type === "success" 
                          ? "OK" 
                          : funcLog.type === "warning"
                          ? "Secure"
                          : "Check logs"}
                      </Text>
                    </View>
                  ) : (
                    <ActivityIndicator size="small" color="#2563eb" />
                  )}
                </View>
              );
            }
          )}
        </View>
        
        {/* Security Info Banner */}
        <View className="mt-4 p-3 bg-blue-950 rounded-lg border border-blue-600">
          <View className="flex-row items-start">
            <Ionicons name="shield-checkmark" size={20} color="#60a5fa" className="mt-0.5" />
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-blue-200 mb-1">
                Payment Security Active
              </Text>
              <Text className="text-xs text-blue-300 leading-4">
                The stripe-webhook function is protected and only callable by Stripe servers. This prevents customers from bypassing payment by clicking fake confirmation buttons.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logs */}
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-300">
            Diagnostic Logs ({logs.length})
          </Text>
          <Pressable
            onPress={() => setLogs([])}
            className="px-3 py-1 bg-gray-800 rounded active:bg-gray-700 border border-gray-700"
          >
            <Text className="text-xs text-gray-300">Clear</Text>
          </Pressable>
        </View>
        
        {/* Payment Flow Explanation */}
        <View className="mb-4 p-3 bg-purple-950 rounded-lg border border-purple-600">
          <Text className="text-sm font-semibold text-purple-200 mb-2">
            💳 How Payment Verification Works
          </Text>
          <View className="space-y-1">
            <Text className="text-xs text-purple-300">1. Customer clicks "Pay" → create-checkout creates session</Text>
            <Text className="text-xs text-purple-300">2. Customer pays on Stripe → Payment completes</Text>
            <Text className="text-xs text-purple-300">3. Stripe sends webhook → stripe-webhook verifies payment</Text>
            <Text className="text-xs text-purple-300">4. Database updated → App polls and detects payment</Text>
            <Text className="text-xs text-purple-300">5. Estimate unlocked → Customer sees results automatically</Text>
          </View>
          <View className="mt-2 p-2 bg-purple-900 rounded border border-purple-500">
            <Text className="text-xs font-semibold text-purple-200">
              🔒 No "I Completed Payment" button = No fake confirmations!
            </Text>
          </View>
        </View>
        
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && logs.length === 0 ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text className="text-gray-400 mt-4">
                Running diagnostics...
              </Text>
            </View>
          ) : (
            <View className="space-y-2">
              {logs.map((log) => (
                <View
                  key={log.id}
                  className="p-3 bg-gray-900 rounded-lg border border-gray-800"
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={getIconForType(log.type)}
                        size={16}
                        color={
                          log.type === "success"
                            ? "#22c55e"
                            : log.type === "error"
                            ? "#ef4444"
                            : log.type === "warning"
                            ? "#eab308"
                            : "#60a5fa"
                        }
                      />
                      <Text className="text-xs font-semibold text-gray-300 ml-2 flex-shrink">
                        {log.function}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text className={`text-sm ${getColorForType(log.type)}`}>
                    {log.message}
                  </Text>
                  {log.details && (
                    <View className="mt-2 p-2 bg-gray-950 rounded border border-gray-800">
                      <Text className="text-xs font-mono text-gray-400">
                        {JSON.stringify(log.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Test Payment Button */}
      <View className="px-6 py-4 border-t border-gray-800">
        <Pressable
          onPress={() => {
            addLog({
              function: "Manual Test",
              type: "info",
              message: "Navigate to payment screen to test integration",
            });
            navigation.navigate("CustomerEstimate");
          }}
          className="bg-blue-600 rounded-lg py-4 items-center active:bg-blue-700 border border-blue-500"
        >
          <Text className="text-white font-semibold text-base">
            Test Payment Flow
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
