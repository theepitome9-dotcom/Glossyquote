import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { useEffect, useState } from "react";
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Crown, Check, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PurchasesPackage } from "react-native-purchases";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isRevenueCatEnabled,
} from "../lib/revenuecatClient";
import { getStripeProducts, openStripeCheckout, type StripeProduct } from "../lib/stripeWebCheckout";
import { useAppStore } from "../state/appStore";

const PRIVACY_POLICY_URL = 'https://glossyquote.com/privacy.html';
const TERMS_OF_SERVICE_URL = 'https://glossyquote.com/terms.html';

type DisplayPackage = {
  id: string;
  title: string;
  description: string;
  priceString: string;
  isAnnual: boolean;
  nativePkg?: PurchasesPackage;
  stripeProductId?: string;
};

export default function PremiumPaywallScreen() {
  const navigation = useNavigation();
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const updateProfessionalPremium = useAppStore((s) => s.updateProfessionalPremium);
  const [packages, setPackages] = useState<DisplayPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);

      if (isWeb) {
        // Use Stripe products for web checkout
        const stripeProducts = await getStripeProducts();
        const subscriptionProducts = stripeProducts.filter((p: StripeProduct) => p.mode === "subscription");
        if (subscriptionProducts.length === 0) {
          Alert.alert("Unavailable", "Subscription plans are temporarily unavailable. Please try again later.");
          return;
        }
        const display: DisplayPackage[] = subscriptionProducts.map((p: StripeProduct) => ({
          id: p.id,
          title: p.name,
          description: p.interval === "month" ? "Billed monthly, cancel anytime" : "Billed annually — best value",
          priceString: p.formattedPrice,
          isAnnual: p.interval === "year",
          stripeProductId: p.id,
        }));
        setPackages(display);
        setSelectedId(display.find(p => !p.isAnnual)?.id ?? display[0]?.id ?? null);
      } else {
        if (!isRevenueCatEnabled()) {
          Alert.alert(
            "Subscriptions Unavailable",
            "Subscriptions are only available on the mobile app.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
          return;
        }
        const offerings = await getOfferings();
        const offering = offerings?.all?.["subscription_plans"] ?? offerings?.current;
        if (!offering?.availablePackages?.length) {
          Alert.alert("No Plans", "No subscription plans are currently available.");
          return;
        }
        const display: DisplayPackage[] = offering.availablePackages.map((pkg: PurchasesPackage) => ({
          id: pkg.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          priceString: pkg.product.priceString,
          isAnnual: pkg.identifier.includes("annual"),
          nativePkg: pkg,
        }));
        setPackages(display);
        setSelectedId(display.find(p => p.id === "$rc_monthly")?.id ?? display[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Error loading offerings:", error);
      Alert.alert("Error", "Failed to load subscription options. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedId) {
      Alert.alert("Select Plan", "Please select a subscription plan.");
      return;
    }
    const pkg = packages.find(p => p.id === selectedId);
    if (!pkg) return;

    setPurchasing(true);
    try {
      if (isWeb && pkg.stripeProductId) {
        await openStripeCheckout({
          productId: pkg.stripeProductId,
          customerEmail: currentProfessional?.email ?? undefined,
          professionalId: currentProfessional?.id,
        });
        // Navigation handled by Stripe redirect — nothing more to do here
      } else if (!isWeb && pkg.nativePkg) {
        const customerInfo = await purchasePackage(pkg.nativePkg);
        if (customerInfo) {
          if (currentProfessional) updateProfessionalPremium(currentProfessional.id, true);
          const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "http://localhost:3000";
          const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || "";
          fetch(`${BACKEND_URL}/api/users/credit-purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-internal-secret": INTERNAL_SECRET },
            body: JSON.stringify({
              professionalId: currentProfessional?.id,
              professionalName: currentProfessional?.name,
              professionalEmail: currentProfessional?.email,
              packageId: pkg.id,
              packageName: pkg.title,
              creditsGranted: 0,
              isSubscription: true,
              amountGbp: null,
              purchasedAt: new Date().toISOString(),
            }),
          }).catch(() => {});
          Alert.alert(
            "Success!",
            "Welcome to Premium! You now have unlimited access to all features.",
            [{ text: "Get Started", onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert("Purchase Failed", "Something went wrong. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (isWeb) {
      Alert.alert("Restore", "To restore a web purchase, please log in with the same account you used when subscribing.");
      return;
    }
    try {
      setPurchasing(true);
      const customerInfo = await restorePurchases();
      if (customerInfo && Object.keys(customerInfo.entitlements.active).length > 0) {
        if (currentProfessional && customerInfo.entitlements.active["premium"]) {
          updateProfessionalPremium(currentProfessional.id, true);
        }
        Alert.alert("Restored!", "Your purchases have been restored.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert("No Purchases", "No previous purchases found.");
      }
    } catch {
      Alert.alert("Restore Failed", "Failed to restore purchases. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const getPeriod = (id: string): string => {
    if (id === "monthly" || id.includes("monthly")) return "/month";
    if (id === "annual" || id.includes("annual")) return "/year";
    return "";
  };

  const selectedPkg = packages.find(p => p.id === selectedId);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-white mt-4">Loading plans...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="items-center px-6 pt-8 pb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-4 right-6 z-10">
            <X size={28} color="#fff" />
          </TouchableOpacity>
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Crown size={40} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-2">Go Premium</Text>
          <Text className="text-gray-400 text-center text-base">
            Unlock unlimited access to all premium features
          </Text>
        </View>

        {/* Features */}
        <View className="px-6 mb-6">
          {[
            "60 credits per month",
            "Priority customer support",
            "Advanced analytics & reporting",
            "Access to all trades",
            "Premium monthly £49/month after trial",
            "Early access to new features",
          ].map((feature, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3">
                <Check size={16} color="#fff" strokeWidth={3} />
              </View>
              <Text className="text-white text-base flex-1">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        {packages.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Choose Your Plan</Text>
            {packages.map((pkg) => {
              const isSelected = selectedId === pkg.id;
              return (
                <TouchableOpacity key={pkg.id} onPress={() => setSelectedId(pkg.id)} className="mb-3">
                  <LinearGradient
                    colors={isSelected ? ["#3b82f6", "#2563eb"] : ["#1f1f1f", "#1f1f1f"]}
                    className="rounded-2xl p-4 border-2"
                    style={{ borderColor: isSelected ? "#3b82f6" : "#333" }}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 mr-2">
                        <Text className="text-white text-lg font-bold mb-1">{pkg.title}</Text>
                        {pkg.isAnnual && (
                          <View className="self-start bg-green-500 px-2 py-1 rounded-full mb-1">
                            <Text className="text-white text-xs font-bold">SAVE ~17%</Text>
                          </View>
                        )}
                        <Text className="text-gray-400 text-sm">{pkg.description}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-white text-2xl font-bold">{pkg.priceString}</Text>
                        <Text className="text-gray-400 text-xs">{getPeriod(pkg.id)}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Subscribe Button */}
        <View className="px-6 mb-4">
          <View className="bg-blue-900/40 border border-blue-700/50 rounded-xl p-4 mb-3">
            <Text className="text-white text-sm text-center font-bold mb-2">
              Premium Monthly — 7-Day Free Trial
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-xs">Price after trial</Text>
              <Text className="text-white text-xs font-semibold">
                {selectedPkg ? `${selectedPkg.priceString}/month` : "£49.00/month"}
              </Text>
            </View>
            <Text className="text-gray-300 text-xs text-center leading-5">
              After your 7-day free trial, your{" "}
              <Text className="text-white font-semibold">Premium Monthly</Text> subscription
              auto-renews at{" "}
              <Text className="text-white font-semibold">
                {selectedPkg ? `${selectedPkg.priceString}/month` : "£49.00/month"}
              </Text>. Cancel anytime before the trial ends.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing || !selectedId}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient colors={["#3b82f6", "#2563eb"]} className="py-4 items-center justify-center">
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="items-center">
                  <Text className="text-white text-base font-bold">
                    {isWeb ? "Subscribe with Stripe" : "Start 7-Day Free Trial"}
                  </Text>
                  <Text className="text-white/90 text-sm font-semibold mt-0.5">
                    Then {selectedPkg?.priceString ?? "£49.00"}/month — Premium Monthly
                  </Text>
                  <Text className="text-white/60 text-xs mt-0.5">Cancel anytime before trial ends</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Restore */}
        <View className="px-6 mb-4">
          <TouchableOpacity onPress={handleRestore} disabled={purchasing} className="py-3 items-center">
            <Text className="text-blue-400 text-base font-semibold">Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View className="px-6 pb-4">
          <Text className="text-gray-400 text-xs text-center leading-5 mb-2 font-semibold">
            Subscription Terms
          </Text>
          <Text className="text-gray-500 text-xs text-center leading-5 mb-1">• Billing period: 1 month (monthly) or 1 year (annual)</Text>
          <Text className="text-gray-500 text-xs text-center leading-5 mb-1">• 7-day free trial for monthly plan</Text>
          <Text className="text-gray-500 text-xs text-center leading-5 mb-3">
            • Auto-renews unless cancelled before the end of the billing period
          </Text>
          <View className="flex-row justify-center items-center mb-2">
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}>
              <Text className="text-blue-400 text-xs underline">Terms of Use</Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs mx-2">•</Text>
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}>
              <Text className="text-blue-400 text-xs underline">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
