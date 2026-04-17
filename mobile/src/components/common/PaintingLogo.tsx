import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

interface PaintingLogoProps {
  onComplete?: () => void;
}

export function PaintingLogo({ onComplete }: PaintingLogoProps) {
  // Progress from 0 (top of G) to 1 (bottom of G where brush sits)
  const paintProgress = useSharedValue(0);
  
  // Logo opacity - LOSSY appears after G is painted
  const lossyOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animation sequence
    
    // 1. Brush paints the G from top to bottom (0-2000ms)
    paintProgress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 2. LOSSY appears after G is painted (2000-2500ms)
    lossyOpacity.value = withDelay(
      2000,
      withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    // 3. Complete callback
    if (onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, 2800);
    }
  }, []);

  // Brush position - only paints down the G letter
  const brushStyle = useAnimatedStyle(() => {
    // Paint the G curve from top to bottom:
    // Following the actual shape of the letter G
    
    const x = interpolate(
      paintProgress.value,
      [0,    0.25,  0.5,   0.75,  1],
      [50,   65,    65,    55,    48]
      // Start top-center, curve right, down right side, curve in, settle at brush position
    );
    
    const y = interpolate(
      paintProgress.value,
      [0,    0.25,  0.5,   0.75,  1],
      [20,   35,    60,    90,    115]
      // Top of G, down the curve, middle, bottom curve, final position
    );
    
    // Rotate to follow the G curve
    const rotation = interpolate(
      paintProgress.value,
      [0,    0.25,  0.5,   0.75,  1],
      [-30,  -10,   20,    90,    135]
      // Start angled, straighten, curve down, curve in, settle
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // LOSSY text appears after G is painted
  const lossyStyle = useAnimatedStyle(() => ({
    opacity: lossyOpacity.value,
    transform: [
      { scale: interpolate(lossyOpacity.value, [0, 1], [0.9, 1]) }
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        {/* Full logo - will be masked to show only what's painted */}
        <Image
          source={require('../../../assets/glossy-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Mask overlay - hides LOSSY until G is painted */}
        <Animated.View style={[styles.lossyMask, lossyStyle]} />

        {/* Animated paintbrush painting only the G */}
        <Animated.View style={[styles.brush, brushStyle]}>
          {/* Brush handle */}
          <View style={styles.brushHandle} />
          
          {/* Brush bristles */}
          <View style={styles.brushBristles} />
          
          {/* Paint drip */}
          <View style={styles.paintDrip} />
          
          {/* Glow effect at brush tip */}
          <View style={styles.brushGlow} />
        </Animated.View>

        {/* Paint trail effect following the brush */}
        <Animated.View style={[styles.paintTrail, brushStyle]}>
          <View style={styles.trailGlow} />
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
  logoWrapper: {
    width: 280,
    height: 140,
    position: 'relative',
    overflow: 'visible',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  lossyMask: {
    position: 'absolute',
    top: 0,
    left: 80, // Covers only LOSSY part
    width: 200,
    height: 140,
    backgroundColor: 'transparent',
  },
  brush: {
    position: 'absolute',
    width: 40,
    height: 80,
    alignItems: 'center',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  brushHandle: {
    width: 10,
    height: 55,
    backgroundColor: '#654321',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 10,
  },
  brushBristles: {
    width: 30,
    height: 30,
    backgroundColor: '#DAA520',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  paintDrip: {
    width: 12,
    height: 18,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    marginTop: -6,
    opacity: 0.95,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  brushGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFD700',
    opacity: 0.5,
    top: 50,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 12,
  },
  paintTrail: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    zIndex: 5,
  },
  trailGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    opacity: 0.3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },
});
