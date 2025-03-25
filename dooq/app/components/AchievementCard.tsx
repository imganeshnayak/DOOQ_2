// import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, ImageBackground } from 'react-native';
// import { Text, Avatar, Button, Card } from 'react-native-paper';
// import { Star, MapPin, Calendar, Edit } from 'lucide-react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import customTheme from '../theme';
// import theme from '../theme';

// interface ProfileBannerProps {
//   avatar: string;
//   name: string;
//   rating: number;
//   completedTasks: number;
//   location: string;
//   memberSince: string;
//   bio: string;
//   onEditPress: () => void;
// }

// const ProfileBanner = ({
//   avatar,
//   name,
//   rating,
//   completedTasks,
//   location,
//   memberSince,
//   bio,
//   onEditPress,
// }: ProfileBannerProps) => {
//   return (
//     <LinearGradient
//       colors={[customTheme.colors.primary, customTheme.colors.secondary]}
//       style={styles.bannerContainer}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <View style={styles.bannerContent}>
//         <View style={styles.avatarContainer}>
//           <Avatar.Image
//             size={100}
//             source={{ uri: avatar }}
//             style={styles.avatar}
//           />
//           <TouchableOpacity 
//             style={styles.editAvatarButton}
//             onPress={onEditPress}
//           >
//             <Edit size={16} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         <Text variant="headlineMedium" style={styles.name}>
//           {name}
//         </Text>

//         <View style={styles.ratingContainer}>
//           <Star size={20} color="#FFD700" fill="#FFD700" />
//           <Text variant="titleMedium" style={styles.rating}>
//             {rating.toFixed(1)} ({completedTasks} reviews)
//           </Text>
//         </View>

//         <View style={styles.infoContainer}>
//           <View style={styles.infoItem}>
//             <MapPin size={16} color="#fff" />
//             <Text variant="bodyMedium" style={styles.infoText}>
//               {location}
//             </Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Calendar size={16} color="#fff" />
//             <Text variant="bodyMedium" style={styles.infoText}>
//               Member since {memberSince}
//             </Text>
//           </View>
//         </View>

//         <Text variant="bodyMedium" style={styles.bio}>
//           {bio || "No bio yet"}
//         </Text>

//         <Button 
//           mode="contained" 
//           style={styles.editButton}
//           onPress={onEditPress}
//           icon={({color}) => <Edit size={16} color={color} />}
//         >
//           Edit Profile
//         </Button>
//       </View>
//     </LinearGradient>
//   );
// };

// interface AchievementCardProps {
//   level: string;
//   points: number;
//   completedTasks: number;
//   badges: string[];
//   nextLevel: string;
//   onPress: () => void;
// }

// export default function AchievementCard({
//   level,
//   points,
//   completedTasks,
//   badges,
//   nextLevel,
//   onPress
// }: AchievementCardProps) {
//   function getLevelColor(): string {
//     // Example logic to determine the color based on the level
//     if (level === 'Gold') return '#FFD700';
//     if (level === 'Silver') return '#C0C0C0';
//     if (level === 'Bronze') return '#CD7F32';
//     return '#FFFFFF'; // Default color
//   }

//   // ...existing code...

//   return (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
//       <Card 
//         style={[
//           styles.card, 
//           { 
//             backgroundColor: theme.colors.elevation.level2,
//             borderLeftWidth: 4,
//             borderLeftColor: getLevelColor()
//           }
//         ]}
//       >
//         <View>
//           {/* Add your content here */}
//           <Text>Achievement Details</Text>
//         </View>
//       </Card>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   bannerContainer: {
//     width: '100%',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     overflow: 'hidden',
//   },
//   bannerContent: {
//     padding: 24,
//     paddingTop: 48,
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   avatar: {
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.8)',
//     backgroundColor: '#f0f0f0',
//   },
//   editAvatarButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: customTheme.colors.primary,
//     borderRadius: 20,
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   name: {
//     marginBottom: 8,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   rating: {
//     marginLeft: 8,
//     color: '#fff',
//   },
//   infoContainer: {
//     width: '100%',
//     marginBottom: 16,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     borderRadius: 12,
//     padding: 12,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   infoText: {
//     marginLeft: 8,
//     color: '#fff',
//   },
//   bio: {
//     textAlign: 'center',
//     marginBottom: 16,
//     color: '#fff',
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     padding: 12,
//     borderRadius: 12,
//     width: '100%',
//   },
//   editButton: {
//     width: '100%',
//     borderRadius: 12,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//   },
//   backgroundImage: {
//     width: '100%',
//     overflow: 'hidden',
//     borderRadius: 12,
//   },
//   card: {
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     elevation: 2,
//   },
// });