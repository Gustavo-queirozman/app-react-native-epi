import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

type SplashScreenProps = {
  onFinish: () => void;
};

const SPLASH_DURATION = 2100;

export function AppSplashScreen({ onFinish }: SplashScreenProps) {
  const { width } = useWindowDimensions();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.8)).current;
  const haloOpacity = useRef(new Animated.Value(0.6)).current;
  const logoWidth = Math.min(Math.max(width - 48, 280), 560);
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const haloAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(haloScale, { duration: 1200, easing: Easing.inOut(Easing.ease), toValue: 1.12, useNativeDriver }),
          Animated.timing(haloScale, { duration: 1200, easing: Easing.inOut(Easing.ease), toValue: 0.8, useNativeDriver }),
        ]),
        Animated.sequence([
          Animated.timing(haloOpacity, { duration: 1200, easing: Easing.inOut(Easing.ease), toValue: 0.14, useNativeDriver }),
          Animated.timing(haloOpacity, { duration: 1200, easing: Easing.inOut(Easing.ease), toValue: 0.6, useNativeDriver }),
        ]),
      ]),
    );

    haloAnimation.start();
    Animated.parallel([
      Animated.timing(logoOpacity, { duration: 600, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver }),
      Animated.spring(logoScale, { bounciness: 7, speed: 10, toValue: 1, useNativeDriver }),
      Animated.timing(progress, { duration: 1750, easing: Easing.inOut(Easing.cubic), toValue: 1, useNativeDriver: false }),
    ]).start();

    const timeout = setTimeout(onFinish, SPLASH_DURATION);
    return () => {
      clearTimeout(timeout);
      haloAnimation.stop();
    };
  }, [haloOpacity, haloScale, logoOpacity, logoScale, onFinish, progress, useNativeDriver]);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Carregando Handsafe" style={styles.container}>
      <View style={styles.visual}>
        <Animated.View style={[styles.logoFrame, { opacity: haloOpacity, transform: [{ scale: haloScale }], width: logoWidth + 48 }]} />
        <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }], width: logoWidth }]}>
          <Image accessibilityIgnoresInvertColors resizeMode="contain" source={require('../assets/handsafe-logo.png')} style={styles.logo} />
        </Animated.View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { transform: [{ scaleX: progress }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#E5F5FD', flex: 1, justifyContent: 'center', overflow: 'hidden' },
  visual: { alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', width: '100%' },
  logoFrame: { aspectRatio: 3, borderColor: '#9FD3F3', borderRadius: 22, borderWidth: 2, pointerEvents: 'none', position: 'absolute' },
  logoWrapper: { aspectRatio: 3, maxHeight: 190 },
  logo: { height: '100%', width: '100%' },
  progressTrack: { backgroundColor: '#DDEAF7', borderRadius: 999, height: 4, marginTop: 32, overflow: 'hidden', width: 148 },
  progressFill: { backgroundColor: '#1677D2', borderRadius: 999, height: '100%', transformOrigin: 'left', width: '100%' },
});
