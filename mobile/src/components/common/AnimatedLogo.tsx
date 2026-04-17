import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
  autoPlay?: boolean;
  duration?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function AnimatedLogo({ 
  onAnimationComplete, 
  autoPlay = true,
  duration = 3000 
}: AnimatedLogoProps) {
  
  // Main animation progress (0 to 1)
  const progress = useSharedValue(0);
  
  // Brush position and rotation
  const brushProgress = useSharedValue(0);
  const brushOpacity = useSharedValue(1);

  useEffect(() => {
    if (autoPlay) {
      startAnimation();
    }
  }, [autoPlay]);

  const startAnimation = () => {
    // Animate the painting progress
    progress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    // Brush follows along
    brushProgress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    // Fade out brush at the end
    brushOpacity.value = withDelay(
      1800,
      withTiming(0, { duration: 300 })
    );

    // Callback
    if (onAnimationComplete) {
      setTimeout(onAnimationComplete, duration);
    }
  };

  // Animated style for reveal effect
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 0.1, 1], [0, 1, 1]),
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.95, 1]) }
      ],
    };
  });

  // Brush animation - moves from top-left to bottom-right following G shape
  const brushAnimatedStyle = useAnimatedStyle(() => {
    const x = interpolate(
      brushProgress.value,
      [0, 0.3, 0.6, 1],
      [-20, 60, 100, 120]
    );
    
    const y = interpolate(
      brushProgress.value,
      [0, 0.3, 0.6, 1],
      [20, 40, 90, 130]
    );
    
    const rotation = interpolate(
      brushProgress.value,
      [0, 0.3, 0.6, 1],
      [-45, -20, 10, 45]
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}deg` },
      ],
      opacity: brushOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Main logo with reveal animation */}
        <AnimatedImage 
          source={require('../../assets/glossy-logo.jpg')}
          style={[styles.logo, logoAnimatedStyle]}
          resizeMode="contain"
        />

        {/* Animated paintbrush */}
        <Animated.View style={[styles.brushContainer, brushAnimatedStyle]}>
          <View style={styles.brushHandle} />
          <View style={styles.brushBristle} />
          <View style={styles.paintDrip} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 280,
    height: 140,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brushContainer: {
    position: 'absolute',
    width: 40,
    height: 80,
    alignItems: 'center',
    top: 0,
    left: 0,
  },
  brushHandle: {
    width: 8,
    height: 50,
    backgroundColor: '#8B4513',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  brushBristle: {
    width: 24,
    height: 24,
    backgroundColor: '#DAA520',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paintDrip: {
    width: 6,
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    marginTop: -3,
    opacity: 0.8,
  },
});
