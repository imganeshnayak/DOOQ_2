import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';
import { getUnreadCount } from '../services/notifications';

export default function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const unreadCount = await getUnreadCount();
        setCount(unreadCount);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <Badge style={styles.badge}>
      {count > 99 ? '99+' : count}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF5733'
  }
});