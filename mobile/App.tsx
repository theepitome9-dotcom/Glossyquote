import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootStackParamList } from "./src/navigation/types";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { FloatingChatButton } from "./src/components/chat/FloatingChatButton";
import { useEffect } from "react";
import { initializeRevenueCat } from "./src/lib/revenuecatClient";
import { useAppStore } from "./src/state/appStore";
import { Pressable, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

// Screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CustomerEstimateScreen from "./src/screens/CustomerEstimateScreen";
import PaymentSelectionScreen from "./src/screens/PaymentSelectionScreen";
import EstimateResultScreen from "./src/screens/EstimateResultScreen";
import JobPostingScreen from "./src/screens/JobPostingScreen";
import CustomerProfileScreen from "./src/screens/CustomerProfileScreen";
import ProfessionalAuthScreen from "./src/screens/ProfessionalAuthScreen";
import ProfessionalDashboardScreen from "./src/screens/ProfessionalDashboardScreen";
import ProfessionalJobBoardScreen from "./src/screens/ProfessionalJobBoardScreen";
import MyLeadsScreen from "./src/screens/MyLeadsScreen";
import ProfessionalProfileScreen from "./src/screens/ProfessionalProfileScreen";
import ProfessionalCreditsScreen from "./src/screens/ProfessionalCreditsScreen";
import PremiumPaywallScreen from "./src/screens/PremiumPaywallScreen";
import JobDetailsScreen from "./src/screens/JobDetailsScreen";
import CostTrackingScreen from "./src/screens/CostTrackingScreen";
import FunctionLogsScreen from "./src/screens/FunctionLogsScreen";
import ReferralScreen from "./src/screens/ReferralScreen";
import ContactScreen from "./src/screens/ContactScreen";
import LegalScreen from "./src/screens/LegalScreen";
import LeadSettingsScreen from "./src/screens/LeadSettingsScreen";
import LeadMapScreen from "./src/screens/LeadMapScreen";
import PerformanceDashboardScreen from "./src/screens/PerformanceDashboardScreen";
import MessageTemplatesScreen from "./src/screens/MessageTemplatesScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen";
import PublicProfessionalProfileScreen from "./src/screens/PublicProfessionalProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Deep linking configuration for password reset
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['glossy://', 'https://glossy.app'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      ProfessionalAuth: 'auth',
      Welcome: '',
    },
  },
};

export default function App() {
  // Force reload on app start
  console.log('🚀 App starting - V2.3 - FEATURES UPDATE - ' + new Date().toISOString());

  const isDarkMode = useAppStore((s) => s.isDarkMode);

  // Initialize RevenueCat on app start
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              initialRouteName="Welcome"
              screenOptions={{
                headerShown: true,
                headerTintColor: "#2563eb",
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                },
                headerTitleStyle: {
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                },
                contentStyle: {
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                },
              }}
            >
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CustomerEstimate"
              component={CustomerEstimateScreen}
              options={({ navigation }) => ({
                title: "Get Estimate",
                headerRight: () => (
                  <Pressable
                    onPress={() => navigation.navigate('CustomerProfile')}
                    className="active:opacity-70"
                    style={{ marginRight: 8 }}
                  >
                    <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#f1f5f9' : '#4b5563'} />
                  </Pressable>
                ),
              })}
            />
            <Stack.Screen
              name="PaymentSelection"
              component={PaymentSelectionScreen}
              options={{ title: "Payment", presentation: "modal" }}
            />
            <Stack.Screen
              name="EstimateResult"
              component={EstimateResultScreen}
              options={{ title: "Your Estimate", headerShown: false }}
            />
            <Stack.Screen
              name="JobPosting"
              component={JobPostingScreen}
              options={{ title: "Post Job", presentation: "modal" }}
            />
            <Stack.Screen
              name="CustomerProfile"
              component={CustomerProfileScreen}
              options={{ title: "My Profile", headerShown: false }}
            />
            <Stack.Screen
              name="ProfessionalAuth"
              component={ProfessionalAuthScreen}
              options={{ title: "Professional Login" }}
            />
            <Stack.Screen
              name="ProfessionalDashboard"
              component={ProfessionalDashboardScreen}
              options={{ title: "Dashboard", headerShown: false }}
            />
            <Stack.Screen
              name="ProfessionalJobBoard"
              component={ProfessionalJobBoardScreen}
              options={{ title: "Available Leads" }}
            />
            <Stack.Screen
              name="MyLeads"
              component={MyLeadsScreen}
              options={{ title: "My Purchased Leads" }}
            />
            <Stack.Screen
              name="ProfessionalProfile"
              component={ProfessionalProfileScreen}
              options={{ title: "My Profile" }}
            />
            <Stack.Screen
              name="ProfessionalCredits"
              component={ProfessionalCreditsScreen}
              options={{ title: "Buy Credits" }}
            />
            <Stack.Screen
              name="PremiumPaywall"
              component={PremiumPaywallScreen}
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="JobDetails"
              component={JobDetailsScreen}
              options={{ title: "Job Details" }}
            />
            <Stack.Screen
              name="CostTracking"
              component={CostTrackingScreen}
              options={{ title: "Cost Tracking" }}
            />
            <Stack.Screen
              name="FunctionLogs"
              component={FunctionLogsScreen}
              options={{ title: "Function Logs", headerShown: false }}
            />
            <Stack.Screen
              name="Referral"
              component={ReferralScreen}
              options={{ title: "Refer & Earn", headerShown: false }}
            />
            <Stack.Screen
              name="Contact"
              component={ContactScreen}
              options={{ title: "Contact Us" }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={{ title: "Legal" }}
            />
            <Stack.Screen
              name="LeadSettings"
              component={LeadSettingsScreen}
              options={{ title: "Lead Settings" }}
            />
            <Stack.Screen
              name="LeadMap"
              component={LeadMapScreen}
              options={{ title: "Lead Map" }}
            />
            <Stack.Screen
              name="PerformanceDashboard"
              component={PerformanceDashboardScreen}
              options={{ title: "Performance" }}
            />
            <Stack.Screen
              name="MessageTemplates"
              component={MessageTemplatesScreen}
              options={{ title: "Messages" }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ title: "Reset Password", headerShown: false }}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
              options={{ title: "Admin Dashboard" }}
            />
            <Stack.Screen
              name="PublicProfessionalProfile"
              component={PublicProfessionalProfileScreen}
              options={{ title: "Professional Profile" }}
            />
            </Stack.Navigator>
            <StatusBar style={isDarkMode ? "light" : "auto"} />
            <FloatingChatButton />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
