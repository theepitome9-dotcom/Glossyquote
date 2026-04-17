import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TrendingUp, Users, ShoppingBag, Briefcase, CreditCard, RefreshCw, ChevronDown, ChevronUp, LogOut } from 'lucide-react-native';
import { useAppStore } from '../state/appStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const INTERNAL_SECRET = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || '';

interface AdminData {
  summary: {
    totalLeadPurchases: number;
    totalCreditPurchases: number;
    totalJobPostings: number;
    totalUsers: number;
    totalCreditsSpentOnLeads: number;
    totalRevenueGbp: number;
  };
  leadPurchases: any[];
  creditPurchases: any[];
  jobPostings: any[];
  users: any[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <View className="mb-4 bg-white rounded-2xl overflow-hidden" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <Pressable onPress={() => setOpen(v => !v)} className="flex-row items-center px-4 py-3 active:opacity-70">
        <View className="mr-3">{icon}</View>
        <Text className="flex-1 font-bold text-gray-900 text-base">{title}</Text>
        <View className="bg-gray-100 rounded-full px-2.5 py-0.5 mr-2">
          <Text className="text-xs font-bold text-gray-600">{count}</Text>
        </View>
        {open ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
      </Pressable>
      {open && <View className="border-t border-gray-100">{children}</View>}
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-xs text-gray-500 flex-1">{label}</Text>
      <Text className={`text-xs font-semibold ${highlight ? 'text-blue-600' : 'text-gray-800'} ml-2 flex-shrink-0`} style={{ maxWidth: '55%' }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }: Props) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const setCurrentProfessional = useAppStore((s) => s.setCurrentProfessional);
  const setUserMode = useAppStore((s) => s.setUserMode);

  const handleLogout = () => {
    setCurrentProfessional(null);
    setUserMode(null);
    navigation.replace('Welcome');
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/admin`, {
        headers: { 'x-internal-secret': INTERNAL_SECRET },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError('');
    } catch (e: any) {
      setError('Failed to load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-gray-500 mt-3">Loading admin data…</Text>
    </View>
  );

  if (error) return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
      <Text className="text-red-500 text-center mb-4">{error}</Text>
      <Pressable onPress={load} className="bg-blue-600 px-6 py-3 rounded-xl active:opacity-80">
        <Text className="text-white font-semibold">Retry</Text>
      </Pressable>
    </SafeAreaView>
  );

  const s = data!.summary;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Owner Header */}
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-gray-900">Admin Dashboard</Text>
              <View className="bg-blue-600 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-bold">OWNER</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm mt-0.5">rods320@yahoo.com</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center bg-gray-100 px-3 py-2 rounded-xl active:opacity-70"
          >
            <LogOut size={16} color="#6b7280" />
            <Text className="text-gray-600 font-medium text-sm ml-1.5">Logout</Text>
          </Pressable>
        </View>
        {/* Summary Cards */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {[
            { label: 'Lead Purchases', value: s.totalLeadPurchases, color: 'bg-blue-600' },
            { label: 'Credit Purchases', value: s.totalCreditPurchases, color: 'bg-purple-600' },
            { label: 'Job Postings', value: s.totalJobPostings, color: 'bg-green-600' },
            { label: 'Total Users', value: s.totalUsers, color: 'bg-orange-500' },
          ].map(card => (
            <View key={card.label} className="bg-white rounded-2xl p-4 flex-1" style={{ minWidth: '45%', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <Text className="text-xs text-gray-500 mb-1">{card.label}</Text>
              <Text className="text-2xl font-bold text-gray-900">{card.value}</Text>
            </View>
          ))}
        </View>

        {/* Revenue Card */}
        <View className="bg-blue-600 rounded-2xl p-5 mb-4" style={{ shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 }}>
          <Text className="text-blue-200 text-sm mb-1">Total Revenue (Credit Purchases)</Text>
          <Text className="text-white text-3xl font-bold">£{s.totalRevenueGbp.toFixed(2)}</Text>
          <Text className="text-blue-200 text-sm mt-1">{s.totalCreditsSpentOnLeads} credits spent on leads</Text>
        </View>

        {/* Credit Purchases */}
        <Section title="Credit & Subscription Purchases" icon={<CreditCard size={18} color="#7c3aed" />} count={data!.creditPurchases.length}>
          {data!.creditPurchases.length === 0 ? (
            <Text className="text-gray-400 text-sm px-4 py-3">No credit purchases yet</Text>
          ) : data!.creditPurchases.map((cp: any, i: number) => (
            <View key={i} className="px-4 py-3 border-b border-gray-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-sm text-gray-900">{cp.professional_name}</Text>
                <View className={`rounded-full px-2 py-0.5 ${cp.is_subscription ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  <Text className={`text-xs font-bold ${cp.is_subscription ? 'text-purple-700' : 'text-blue-700'}`}>
                    {cp.is_subscription ? 'SUBSCRIPTION' : 'CREDITS'}
                  </Text>
                </View>
              </View>
              <Row label="Package" value={cp.package_name} highlight />
              <Row label="Email" value={cp.professional_email} />
              {cp.credits_granted > 0 && <Row label="Credits Granted" value={cp.credits_granted.toString()} />}
              {cp.amount_gbp && <Row label="Amount" value={`£${cp.amount_gbp}`} highlight />}
              <Row label="Date" value={formatDate(cp.purchased_at)} />
            </View>
          ))}
        </Section>

        {/* Lead Purchases */}
        <Section title="Lead Purchases" icon={<ShoppingBag size={18} color="#2563eb" />} count={data!.leadPurchases.length}>
          {data!.leadPurchases.length === 0 ? (
            <Text className="text-gray-400 text-sm px-4 py-3">No lead purchases yet</Text>
          ) : data!.leadPurchases.map((lp: any, i: number) => (
            <View key={i} className="px-4 py-3 border-b border-gray-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-sm text-gray-900">{lp.professional_name}</Text>
                <View className={`rounded-full px-2 py-0.5 ${lp.is_premium ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <Text className={`text-xs font-bold ${lp.is_premium ? 'text-purple-700' : 'text-gray-600'}`}>
                    {lp.is_premium ? 'PREMIUM' : 'STANDARD'}
                  </Text>
                </View>
              </View>
              <Row label="Pro Email" value={lp.professional_email} />
              <Row label="Pro Phone" value={lp.professional_phone || 'N/A'} />
              <Row label="Customer" value={lp.customer_name} highlight />
              <Row label="Cust. Phone" value={lp.customer_phone || 'N/A'} highlight />
              <Row label="Cust. Email" value={lp.customer_email || 'N/A'} />
              <Row label="Trade" value={lp.trade_category?.replace(/-/g, ' ')} />
              <Row label="Postcode" value={lp.postcode || 'N/A'} />
              <Row label="Credits Spent" value={lp.credits_spent?.toString()} />
              <Row label="Date" value={formatDate(lp.purchased_at)} />
            </View>
          ))}
        </Section>

        {/* Job Postings */}
        <Section title="Job Postings" icon={<Briefcase size={18} color="#16a34a" />} count={data!.jobPostings.length}>
          {data!.jobPostings.length === 0 ? (
            <Text className="text-gray-400 text-sm px-4 py-3">No jobs posted yet</Text>
          ) : data!.jobPostings.map((jp: any, i: number) => (
            <View key={i} className="px-4 py-3 border-b border-gray-50">
              <Text className="font-semibold text-sm text-gray-900 mb-1">{jp.customer_name} — {jp.trade_category?.replace(/-/g, ' ')}</Text>
              <Row label="Phone" value={jp.customer_phone} highlight />
              <Row label="Email" value={jp.customer_email || 'N/A'} />
              <Row label="Postcode" value={jp.postcode || 'N/A'} />
              <Row label="Description" value={jp.description} />
              {jp.estimate_paid ? <Row label="Estimate" value={`£${jp.estimate_min_price}–£${jp.estimate_max_price}`} highlight /> : null}
              <Row label="Posted" value={formatDate(jp.posted_at)} />
            </View>
          ))}
        </Section>

        {/* Registered Users */}
        <Section title="Registered Users" icon={<Users size={18} color="#ea580c" />} count={data!.users.length}>
          {data!.users.length === 0 ? (
            <Text className="text-gray-400 text-sm px-4 py-3">No registered users yet</Text>
          ) : data!.users.map((u: any, i: number) => (
            <View key={i} className="px-4 py-3 border-b border-gray-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-sm text-gray-900">{u.name}</Text>
                <View className="flex-row gap-1">
                  <View className={`rounded-full px-2 py-0.5 ${u.user_type === 'professional' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <Text className={`text-xs font-bold ${u.user_type === 'professional' ? 'text-blue-700' : 'text-green-700'}`}>
                      {u.user_type?.toUpperCase()}
                    </Text>
                  </View>
                  {u.is_premium ? (
                    <View className="bg-purple-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs font-bold text-purple-700">PREMIUM</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Row label="Email" value={u.email || 'N/A'} />
              <Row label="Phone" value={u.phone || 'N/A'} />
              {u.trade_categories && <Row label="Trades" value={u.trade_categories} />}
              <Row label="Joined" value={formatDate(u.registered_at)} />
            </View>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
