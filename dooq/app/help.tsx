import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Card, Button, Divider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { HelpCircle, MessageCircle, Book, Phone, Mail, AlertCircle, Shield } from 'lucide-react-native';
import customTheme from './theme';

export default function HelpScreen() {
  const faqs = [
    {
      question: 'How do I post a task?',
      answer: 'To post a task, go to the home screen and tap the "Post Task" button. Fill in the details about your task, set a budget, and publish it for Taskers to see.'
    },
    {
      question: 'How do payments work?',
      answer: 'We use secure payment processing through Stripe. Payments are held securely until the task is completed to your satisfaction.'
    },
    {
      question: 'How do I contact a Tasker?',
      answer: 'Once you\'ve posted a task or received an offer, you can message the Tasker directly through our in-app messaging system.'
    },
    {
      question: 'What if I need to cancel a task?',
      answer: 'You can cancel a task anytime before it\'s started. If cancelled less than 24 hours before the scheduled time, a cancellation fee may apply.'
    }
  ];

  const contactMethods = [
    {
      title: 'Call Support',
      description: 'Speak directly with our support team',
      icon: <Phone size={24} color={customTheme.colors.primary} />,
      action: () => Linking.openURL('tel:+18005551234')
    },
    {
      title: 'Email Us',
      description: 'Get a response within 24 hours',
      icon: <Mail size={24} color={customTheme.colors.primary} />,
      action: () => Linking.openURL('mailto:support@taskapp.com')
    },
    {
      title: 'Live Chat',
      description: 'Instant help during business hours',
      icon: <MessageCircle size={24} color={customTheme.colors.primary} />,
      action: () => console.log('Open chat')
    }
  ];

  const resources = [
    {
      title: 'Safety Tips',
      icon: <Shield size={24} color={customTheme.colors.primary} />
    },
    {
      title: 'Community Guidelines',
      icon: <AlertCircle size={24} color={customTheme.colors.primary} />
    },
    {
      title: 'How TaskApp Works',
      icon: <HelpCircle size={24} color={customTheme.colors.primary} />
    }
  ];

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Help & Support',
          headerStyle: {
            backgroundColor: customTheme.colors.surface,
          },
          headerTitleStyle: {
            color: customTheme.colors.onSurface,
          },
        }}
      />
      <ScrollView style={styles.container}>
        {/* Emergency Contact Card */}
        <Card style={[styles.card, styles.emergencyCard]}>
          <Card.Content style={styles.emergencyContent}>
            <View style={styles.emergencyTextContainer}>
              <Text variant="titleLarge" style={styles.emergencyTitle}>
                Need immediate help?
              </Text>
              <Text variant="bodyMedium" style={styles.emergencyText}>
                Contact our 24/7 support line for urgent issues
              </Text>
            </View>
            <Button 
              mode="contained" 
              icon={Phone}
              style={styles.emergencyButton}
              labelStyle={styles.emergencyButtonText}
              onPress={() => Linking.openURL('tel:+18005551234')}
            >
              Call Now
            </Button>
          </Card.Content>
        </Card>

        {/* Contact Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Contact Options
            </Text>
            <Divider style={styles.divider} />
            {contactMethods.map((method, index) => (
              <List.Item
                key={index}
                title={method.title}
                description={method.description}
                left={() => <View style={styles.iconContainer}>{method.icon}</View>}
                onPress={method.action}
                style={styles.listItem}
                titleStyle={styles.listTitle}
                descriptionStyle={styles.listDescription}
              />
            ))}
          </Card.Content>
        </Card>

        {/* FAQs */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Frequently Asked Questions
            </Text>
            <Divider style={styles.divider} />
            {faqs.map((faq, index) => (
              <List.Accordion
                key={index}
                title={faq.question}
                titleStyle={styles.faqQuestion}
                style={styles.faqItem}
                left={() => (
                  <View style={styles.iconContainer}>
                    <HelpCircle size={20} color={customTheme.colors.primary} />
                  </View>
                )}
              >
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </List.Accordion>
            ))}
          </Card.Content>
        </Card>

        {/* Help Resources */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Help Resources
            </Text>
            <Divider style={styles.divider} />
            {resources.map((resource, index) => (
              <List.Item
                key={index}
                title={resource.title}
                left={() => <View style={styles.iconContainer}>{resource.icon}</View>}
                style={styles.listItem}
                titleStyle={styles.listTitle}
                onPress={() => console.log(`Open ${resource.title}`)}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.surface,
    paddingTop: 8,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: customTheme.colors.surface,
  },
  emergencyCard: {
    backgroundColor: customTheme.colors.errorContainer,
    borderLeftWidth: 4,
    borderLeftColor: customTheme.colors.error,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    color: customTheme.colors.onErrorContainer,
    fontWeight: 'bold',
  },
  emergencyText: {
    color: customTheme.colors.onErrorContainer,
    opacity: 0.8,
  },
  emergencyButton: {
    backgroundColor: customTheme.colors.error,
    marginLeft: 16,
  },
  emergencyButtonText: {
    color: customTheme.colors.onError,
  },
  sectionTitle: {
    color: customTheme.colors.primary,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: customTheme.colors.outline,
  },
  listItem: {
    paddingVertical: 12,
  },
  listTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
  },
  listDescription: {
    color: customTheme.colors.onSurfaceVariant,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  faqItem: {
    backgroundColor: customTheme.colors.surfaceVariant,
    marginBottom: 4,
    borderRadius: 8,
    paddingVertical: 12,
  },
  faqQuestion: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
  },
  faqAnswer: {
    padding: 16,
    color: customTheme.colors.onSurfaceVariant,
    lineHeight: 22,
  },
});