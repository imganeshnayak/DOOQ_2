import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import customTheme from '../theme'; // Import the custom theme

interface HeaderProps {
  title: string;
  showLogo?: boolean;
}

export default function Header({ title, showLogo = true }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Surface style={[styles.header, { paddingTop: insets.top }]} elevation={0}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,87,51,0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerContent}>
        {showLogo && (
          <Text variant="titleLarge" style={[styles.logo, { color: customTheme.colors.primary }]}>
            DOOQ
          </Text>
        )}
        <Text variant="headlineSmall" style={[styles.title, { color: customTheme.colors.text }]}>
          {title}
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: '#FF5733',
    fontFamily: 'Poppins-Bold',
  },
  title: {
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    textAlign: 'center',
  },
}); 