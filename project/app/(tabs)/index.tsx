import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Plus, GraduationCap, PartyPopper, Heart, Calendar, MessageSquare } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface SuggestedMessage {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
}

export default function HomeScreen() {
  const { firstName } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

   const userName = Array.isArray(firstName) ? firstName[0] : firstName || 'there';
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const suggestedMessages: SuggestedMessage[] = [
    {
      id: '1',
      title: 'First Day of School',
      category: 'Emotional Support',
      icon: GraduationCap,
      color: '#8B5CF6',
      backgroundColor: '#F3E8FF',
    },
    {
      id: '2',
      title: 'Upcoming Birthday',
      category: 'Life Milestone',
      icon: PartyPopper,
      color: '#EC4899',
      backgroundColor: '#FCE7F3',
    },
    {
      id: '3',
      title: 'Just Because',
      category: 'Daily Love',
      icon: Heart,
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
    },
    {
      id: '4',
      title: 'Achievement Celebration',
      category: 'Encouragement',
      icon: Calendar,
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
    },
  ];

  const handleCreateMessage = () => {
    console.log('Create new message');
  };

  const handleSuggestedMessage = (messageId: string) => {
    console.log('Selected suggested message:', messageId);
  };

  const renderSuggestedMessage = (message: SuggestedMessage, index: number) => {
    const IconComponent = message.icon;
    
    return (
      <Animated.View
        key={message.id}
        style={[
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 10 + (index * 5)],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.suggestedCard, { backgroundColor: message.backgroundColor }]}
          onPress={() => handleSuggestedMessage(message.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: message.color }]}>
            <IconComponent size={24} color="#ffffff" strokeWidth={2} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: message.color }]}>{message.title}</Text>
            <Text style={styles.cardCategory}>{message.category}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hi {userName} 👋</Text>
            <Text style={styles.subtitle}>Time to create some memorable messages</Text>
          </View>

          {/* Create New TimeCapsule Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateMessage}
            activeOpacity={0.9}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2} />
            <Text style={styles.createButtonText}>Create New TimeCapsule</Text>
          </TouchableOpacity>

          {/* Suggested Messages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Messages</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedContainer}
              style={styles.suggestedScrollView}
            >
              {suggestedMessages.map((message, index) => 
                renderSuggestedMessage(message, index)
              )}
            </ScrollView>
          </View>

          {/* Banner Section */}
          <Animated.View
            style={[
              styles.bannerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/images/home-image.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Let us help you send some light. ✨</Text>
                <Text style={styles.bannerDescription}>
                  Share a thoughtful daily affirmation — schedule it now and brighten their day.
                </Text>
              </View>
              
            </View>
          </Animated.View>

          {/* Upcoming Messages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Messages</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You haven't scheduled any messages yet. Once you do, they'll appear here with their delivery dates.
              </Text>
            </View>
          </View>

          {/* Recent Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No activity yet — but once you share your first message, it'll show up here.
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    backgroundColor: '#3B4F75',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 24,
    fontFamily: 'Inter-Bold',
  },
  suggestedScrollView: {
    paddingLeft: 24,
  },
  suggestedContainer: {
    paddingRight: 24,
    gap: 16,
  },
  suggestedCard: {
    width: 300,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  cardCategory: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  bannerContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerImage: {
    width: '100%',
    height: 160,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  bannerContent: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
    paddingBottom: 25,
    fontFamily: 'Inter-Bold',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
  },
 
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});