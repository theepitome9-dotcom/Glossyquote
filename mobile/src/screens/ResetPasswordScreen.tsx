import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { updatePassword, supabase } from '../api/supabase';
import { useAlert } from '../components/modals/CustomAlert';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  // Listen for auth state changes (when user clicks reset link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Check if we already have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Password validation
  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    return { valid: true };
  };

  const handleResetPassword = async () => {
    if (!password.trim()) {
      showAlert('Missing Password', 'Please enter a new password', [{ text: 'OK' }], 'error');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      showAlert('Weak Password', passwordValidation.error!, [{ text: 'OK' }], 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match', [{ text: 'OK' }], 'error');
      return;
    }

    setProcessing(true);

    try {
      const result = await updatePassword(password);

      if (result.success) {
        setSuccess(true);
        showAlert(
          'Password Updated',
          'Your password has been successfully updated. You can now log in with your new password.',
          [{ text: 'Go to Login', onPress: () => navigation.replace('ProfessionalAuth') }],
          'success'
        );
      } else {
        showAlert('Error', result.error || 'Failed to update password', [{ text: 'OK' }], 'error');
      }
    } catch (error: any) {
      showAlert('Error', 'Failed to update password. Please try again.', [{ text: 'OK' }], 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (!sessionReady) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <View className="items-center px-6">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-600 text-center mt-4">
            Verifying reset link...
          </Text>
          <Pressable
            onPress={() => navigation.replace('ProfessionalAuth')}
            className="mt-8"
          >
            <Text className="text-blue-600 font-medium">Back to Login</Text>
          </Pressable>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <View className="items-center px-6">
          <View className="bg-green-100 rounded-full p-6 mb-4">
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Password Updated!
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Your password has been successfully changed.
          </Text>
          <Pressable
            onPress={() => navigation.replace('ProfessionalAuth')}
            className="bg-blue-600 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-semibold text-lg">Go to Login</Text>
          </Pressable>
        </View>
        <AlertComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-6">
        {/* Header */}
        <Pressable
          onPress={() => navigation.replace('ProfessionalAuth')}
          className="flex-row items-center mb-8"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="text-gray-700 text-lg ml-2">Back to Login</Text>
        </Pressable>

        <View className="items-center mb-8">
          <View className="bg-blue-100 rounded-full p-6 mb-4">
            <Ionicons name="key" size={48} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Create New Password
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Enter your new password below
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Min 8 characters, 1 uppercase, 1 lowercase, 1 number
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Pressable
          onPress={handleResetPassword}
          disabled={processing}
          className={`py-4 rounded-2xl ${processing ? 'bg-blue-400' : 'bg-blue-600 active:opacity-80'}`}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Update Password
            </Text>
          )}
        </Pressable>
      </View>
      <AlertComponent />
    </SafeAreaView>
  );
}
