import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../state/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

export default function ReferralScreen({ navigation }: Props) {
  const currentProfessional = useAppStore((s) => s.currentProfessional);
  const currentCustomer = useAppStore((s) => s.currentCustomer);
  const [copied, setCopied] = useState(false);

  const isProfessional = !!currentProfessional;
  const referralCode = currentProfessional?.referralCode || currentCustomer?.referralCode || '';
  const referrals = currentProfessional?.referrals || currentCustomer?.referrals || [];
  const earnings = isProfessional
    ? currentProfessional?.referralEarnings || 0
    : currentCustomer?.referralCredits || 0;

  const referralUrl = `https://glossyapp.co.uk/join?ref=${referralCode}`;

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      const message = isProfessional
        ? `Join GLOSSY as a professional and get £25 bonus! I'm already using it to grow my trade business. Use my code: ${referralCode}\n\n${referralUrl}`
        : `Get instant trade estimates with GLOSSY! Use my referral code ${referralCode} and get £25 off your first job.\n\n${referralUrl}`;

      await Share.share({
        message,
        title: 'Join GLOSSY',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'signed_up');
  const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'rewarded');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6">
            <Pressable onPress={() => navigation.goBack()} className="mb-4">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </Pressable>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Refer & Earn
            </Text>
            <Text className="text-base text-gray-600">
              {isProfessional
                ? 'Invite professionals and earn £50 per successful referral'
                : 'Invite friends and get £25 credit per successful referral'}
            </Text>
          </View>

          {/* Earnings Card */}
          <Card variant="elevated" padding="lg" className="mb-6 bg-gradient-to-br from-green-50 to-green-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-green-800 mb-1">
                  {isProfessional ? 'TOTAL EARNINGS' : 'TOTAL CREDITS'}
                </Text>
                <Text className="text-4xl font-bold text-green-600">
                  £{earnings}
                </Text>
                <Text className="text-sm text-green-700 mt-1">
                  From {completedReferrals.length} referral{completedReferrals.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View className="bg-green-600 rounded-full p-4">
                <Ionicons name="gift" size={32} color="white" />
              </View>
            </View>
          </Card>

          {/* How It Works */}
          <Card variant="default" padding="lg" className="mb-6 bg-blue-50">
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-600 rounded-full p-2 mr-3">
                <Ionicons name="information-circle" size={24} color="white" />
              </View>
              <Text className="text-lg font-bold text-gray-900">How It Works</Text>
            </View>

            <View className="space-y-4">
              <View className="flex-row items-start mb-4">
                <View className="bg-blue-600 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold mb-1">Share Your Code</Text>
                  <Text className="text-gray-600 text-sm">
                    {isProfessional
                      ? 'Invite other professionals to join GLOSSY'
                      : 'Share your referral code with friends'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-4">
                <View className="bg-blue-600 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold mb-1">They Sign Up</Text>
                  <Text className="text-gray-600 text-sm">
                    {isProfessional
                      ? 'Your friend joins as a professional and gets £25 bonus credits'
                      : 'Your friend signs up and gets £25 off their first job'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="bg-blue-600 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold mb-1">You Both Earn</Text>
                  <Text className="text-gray-600 text-sm">
                    {isProfessional
                      ? 'When they purchase their first lead pack, you get £50 in credits'
                      : 'When they complete their first job, you get £25 credit'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Referral Code */}
          <Card variant="elevated" padding="lg" className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2 text-center">
              YOUR REFERRAL CODE
            </Text>
            <View className="bg-gray-100 rounded-xl p-4 mb-4">
              <Text className="text-center text-2xl font-bold text-gray-900 tracking-wider">
                {referralCode}
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Button onPress={handleCopyCode} variant="outline" fullWidth>
                  <Ionicons name={copied ? "checkmark-circle" : "copy"} size={20} color={copied ? "#16A34A" : "#2563EB"} />
                  <Text className={`ml-2 font-semibold ${copied ? 'text-green-600' : 'text-blue-600'}`}>
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Text>
                </Button>
              </View>
              <View className="flex-1">
                <Button onPress={handleShare} fullWidth>
                  <Ionicons name="share-social" size={20} color="white" />
                  <Text className="text-white ml-2 font-semibold">Share</Text>
                </Button>
              </View>
            </View>
          </Card>

          {/* Referral Stats */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Your Referrals</Text>

            <View className="flex-row space-x-3 mb-4">
              <Card variant="outlined" padding="md" className="flex-1">
                <Text className="text-2xl font-bold text-blue-600 text-center">
                  {pendingReferrals.length}
                </Text>
                <Text className="text-xs text-gray-600 text-center mt-1">Pending</Text>
              </Card>

              <Card variant="outlined" padding="md" className="flex-1">
                <Text className="text-2xl font-bold text-green-600 text-center">
                  {completedReferrals.length}
                </Text>
                <Text className="text-xs text-gray-600 text-center mt-1">Completed</Text>
              </Card>
            </View>
          </View>

          {/* Recent Referrals */}
          {referrals.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Recent Activity</Text>

              {referrals.slice(0, 5).map((referral) => (
                <Card key={referral.id} variant="outlined" padding="md" className="mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold">
                        {referral.refereeType === 'professional' ? 'Professional' : 'Customer'} Referral
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${
                      referral.status === 'rewarded' ? 'bg-green-100' :
                      referral.status === 'completed' ? 'bg-blue-100' :
                      referral.status === 'signed_up' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        referral.status === 'rewarded' ? 'text-green-700' :
                        referral.status === 'completed' ? 'text-blue-700' :
                        referral.status === 'signed_up' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {referral.status === 'rewarded' ? '✓ Earned' :
                         referral.status === 'completed' ? 'Complete' :
                         referral.status === 'signed_up' ? 'Signed Up' :
                         'Pending'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Terms */}
          <Card variant="default" padding="md" className="mb-6 bg-gray-50">
            <Text className="text-xs text-gray-600 leading-5">
              <Text className="font-semibold">Terms & Conditions:{'\n'}</Text>
              • {isProfessional ? 'Professionals' : 'Customers'} must use your referral code during signup{'\n'}
              • Rewards are credited after the referred user completes their first {isProfessional ? 'purchase' : 'job'}{'\n'}
              • Referral credits can be used for {isProfessional ? 'lead purchases' : 'job payments'}{'\n'}
              • Self-referrals and fraudulent activity will result in account suspension{'\n'}
              • GLOSSY reserves the right to modify or terminate the referral program at any time
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
