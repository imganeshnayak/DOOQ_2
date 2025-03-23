import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import customTheme from '../theme'; // Import the custom theme

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'light' | 'dark';
  gradient?: boolean; // Add gradient prop
}

export default function Logo({ size = 'medium', color = 'dark', gradient = false }: LogoProps) {
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 36;
      default:
        return 28;
    }
  };

  return (
    <View style={styles.container}>
      {gradient ? (
        <LinearGradient
          colors={[customTheme.colors.primary, customTheme.colors.secondary]} // Use gradient colors
          start={{ x: 0, y: 0 }} // Gradient direction
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <Text
            style={[
              styles.logo,
              { fontSize: getFontSize() },
              color === 'light' && styles.lightText,
            ]}
          >
            DOOQ
          </Text>
        </LinearGradient>
      ) : (
        <Text
          style={[
            styles.logo,
            { fontSize: getFontSize() },
            color === 'light' && styles.lightText,
          ]}
        >
          DOOQ
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'Poppins-Bold',
    color: customTheme.colors.primary, // Use primary color from theme
    letterSpacing: 1,
  },
  lightText: {
    color: '#fff',
  },
  gradientBackground: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // Rounded corners for gradient background
  },
});