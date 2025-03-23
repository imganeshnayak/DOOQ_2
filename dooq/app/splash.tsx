import { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import customTheme from './theme';

const { width } = Dimensions.get('window');

// Define the type for AnimatedLetter props
interface AnimatedLetterProps {
  animation: Animated.Value;
  letter: string;
  isSpecial?: boolean; // Make isSpecial optional
}

export default function SplashScreen() {
  // Create animated values for each letter
  const letterAnimations = {
    D: new Animated.Value(0),
    O1: new Animated.Value(0),
    O2: new Animated.Value(0),
    Q: new Animated.Value(0),
  };

  // Create animated values for the tagline
  const taglineOpacity = new Animated.Value(0);
  const taglineTranslateY = new Animated.Value(20);

  // Create animated value for gradient transition
  const gradientAnimation = new Animated.Value(0);

  useEffect(() => {
    // Sequence for letter animations
    const letterSequence = [
      Animated.timing(letterAnimations.D, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(letterAnimations.O1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(letterAnimations.O2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(letterAnimations.Q, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ];

    // Stagger the letter animations
    Animated.stagger(150, letterSequence).start(() => {
      // Animate tagline after letters
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate gradient transition after animations
      Animated.timing(gradientAnimation, {
        toValue: 1,
        duration: 1500, // Slow gradient change
        useNativeDriver: false,
      }).start();
    });

    // Navigate after animations
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Component for animated letters
  const AnimatedLetter: React.FC<AnimatedLetterProps> = ({ animation, letter, isSpecial = false }) => {
    return (
      <View style={styles.letterWrapper}>
        {/* Static glow effect */}
        <View style={[styles.glow, isSpecial && styles.specialGlow]} />
        
        {/* Animated letter */}
        <Animated.Text
          style={[
            styles.letter,
            {
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 0.5, 0.7, 1],
                    outputRange: [0, 1.2, 0.9, 1],
                  }),
                },
              ],
              opacity: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            isSpecial && styles.specialLetter,
          ]}
        >
          {letter}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient with Animated Colors */}
      <LinearGradient
        colors={[
          gradientAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [customTheme.colors.secondary, '#ff5733'], // Start → End
          }),
          gradientAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#1a1a1a', '#000'], // Secondary transition
          }),
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <AnimatedLetter animation={letterAnimations.D} letter="D" isSpecial={true} />
          <AnimatedLetter animation={letterAnimations.O1} letter="O" />
          <AnimatedLetter animation={letterAnimations.O2} letter="O" />
          <AnimatedLetter animation={letterAnimations.Q} letter="Q" isSpecial={true} />
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Get Tasks Done
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -2, // Adjust letter spacing
  },
  letter: {
    fontSize: 64,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  specialLetter: {
    color: '#FF5733',
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 1.5 }],
  },
  specialGlow: {
    backgroundColor: 'rgba(255, 87, 51, 0.2)',
  },
  tagline: {
    marginTop: 24,
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    letterSpacing: 1,
    backgroundColor: 'transparent',
  },
});
