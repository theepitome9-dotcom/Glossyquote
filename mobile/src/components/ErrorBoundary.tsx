import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView className="flex-1" contentContainerClassName="flex-1">
            <View className="flex-1 justify-center items-center px-6">
              {/* Error Icon */}
              <View className="bg-red-100 rounded-full p-6 mb-6">
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
              </View>

              {/* Error Title */}
              <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Oops! Something went wrong
              </Text>

              {/* Error Message */}
              <Text className="text-gray-600 mb-6 text-center">
                {"We're sorry for the inconvenience. The app encountered an unexpected error."}
              </Text>

              {/* Error Details (Dev mode) */}
              {__DEV__ && this.state.error && (
                <View className="bg-gray-100 rounded-xl p-4 mb-6 w-full max-h-48">
                  <ScrollView>
                    <Text className="text-xs text-gray-800 font-mono">
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text className="text-xs text-gray-600 font-mono mt-2">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Reset Button */}
              <Pressable
                onPress={this.handleReset}
                className="bg-blue-600 py-4 px-8 rounded-xl active:opacity-80 mb-3"
              >
                <Text className="text-white font-semibold text-lg">Try Again</Text>
              </Pressable>

              {/* Help Text */}
              <Text className="text-gray-500 text-sm text-center">
                If the problem persists, please contact support
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
