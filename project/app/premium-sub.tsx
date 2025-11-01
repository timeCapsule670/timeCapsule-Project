import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Lock, Play, Bell, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingAnimation from '../components/loading-animation';

interface PricingPlan {
  id: string;
  duration: string;
  price: string;
  billingText: string;
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
}

interface Feature {
  id: string;
  name: string;
  free: boolean;
  premium: boolean;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  
}

export default function PremiumSubscriptionScreen() {
  const router = useRouter();
  const [selectedBilling, setSelectedBilling] = useState<'month' | 'year'>('year');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pricingPlans: PricingPlan[] = [
    {
      id: '12months',
      duration: '12 Months',
      price: '$4.17/mo',
      billingText: 'billed $49.99 upfront',
      badge: 'Best Value - 30% off',
      badgeColor: '#FCB32B',
    },
    {
      id: '6months',
      duration: '6 Months',
      price: '$5.00/mo',
      billingText: 'billed $29.99 upfront',
      badge: 'Save 17%',
      badgeColor: '#FCB32B',
    },
    {
      id: '1month',
      duration: '1 Month',
      price: '$5.99/mo',
      billingText: 'Cancel anytime',
    },
  ];

  const features: Feature[] = [
    { id: '1', name: 'View Memories', free: true, premium: true },
    { id: '2', name: 'Create and Schedule Messages', free: false, premium: true },
    { id: '3', name: 'Use "Open When" Delivery', free: false, premium: true },
    { id: '4', name: 'Link Family Accounts', free: false, premium: true },
    { id: '5', name: 'Add comments & Replies', free: false, premium: true },
    { id: '6', name: 'Daily Prompt Inspiration', free: false, premium: true },
  ];

  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      title: 'Now',
      description: 'Get full access to all features',
      icon: require('../assets/images/icon-park-solid_play.png'),
     
    },
    {
      id: '2',
      title: 'Day 28',
      description: 'Reminder before trial ends',
      icon: require('../assets/images/line-md_bell-filled.png'),
     
    },
    {
      id: '3',
      title: 'Day 30',
      description: 'Subscription begins (cancel anytime)',
      icon: require('../assets/images/tabler_star-filled.png'),
     
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleBillingToggle = (billing: 'month' | 'year') => {
    setSelectedBilling(billing);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleStartFreeTrial = () => {
    // Show loading animation
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    // Navigate to the next step after loading animation completes
    router.push('/link-account');
  };

  const renderPricingPlan = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id;
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.pricingCard,
          isSelected && styles.pricingCardSelected,
          plan.isPopular && styles.pricingCardPopular,
        ]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.8}
      >
        {plan.badge && (
          <View style={[styles.badge, { backgroundColor: plan.badgeColor }]}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}
        
        <View style={styles.pricingContent}>
          <View style={styles.pricingLeft}>
            <Text style={[
              styles.pricingDuration,
              isSelected && styles.pricingDurationSelected,
            ]}>
              {plan.duration}
            </Text>
            <Text style={[
              styles.pricingTrial,
              isSelected && styles.pricingTrialSelected,
            ]}>
              30-day free trial
            </Text>
          </View>
          
          <View style={styles.pricingRight}>
            <Text style={[
              styles.pricingPrice,
              isSelected && styles.pricingPriceSelected,
            ]}>
              {plan.price}
            </Text>
            <Text style={[
              styles.pricingBilling,
              isSelected && styles.pricingBillingSelected,
            ]}>
              {plan.billingText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeature = (feature: Feature) => {
    return (
      <View key={feature.id} style={styles.featureRow}>
        <Text style={styles.featureName}>{feature.name}</Text>
        
        <View style={styles.featureColumns}>
          <View style={styles.featureColumn}>
            {feature.free ? (
              <Check size={20} color="#10B981" strokeWidth={2} />
            ) : (
             <Image source={require('../assets/images/material-symbols_lock.png')} style={styles.featureIcon} />
            )}
          </View>
          
          <View style={styles.featureColumn}>
            <Check size={20} color="#10B981" strokeWidth={2} />
          </View>
        </View>
      </View>
    );
  };

  const renderTimelineItem = (item: TimelineItem) => {
    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={[styles.timelineIcon]}>
          <Image 
            source={item.icon} 
            style={styles.timelineIconImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.timelineDescription}>{item.description}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  // Show loading animation if isLoading is true
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        duration={8000}
        showSuccess={true}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#D1E2F9', '#C28FEF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity> */}
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>
              Give your family the full TimeCapsule experience
            </Text>
            
            <Text style={styles.subtitle}>
              Premium unlocks all the ways to capture, schedule, and share memories that last forever.
            </Text>

            {/* Billing Toggle */}
            <View style={styles.billingToggle}>
              <TouchableOpacity
                style={[
                  styles.billingOption,
                  selectedBilling === 'month' && styles.billingOptionSelected,
                ]}
                onPress={() => handleBillingToggle('month')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.billingOptionText,
                  selectedBilling === 'month' && styles.billingOptionTextSelected,
                ]}>
                  Month
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.billingOption,
                  selectedBilling === 'year' && styles.billingOptionSelected,
                ]}
                onPress={() => handleBillingToggle('year')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.billingOptionText,
                  selectedBilling === 'year' && styles.billingOptionTextSelected,
                ]}>
                  Year
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pricing Plans */}
            <View style={styles.pricingSection}>
              {pricingPlans.map(plan => renderPricingPlan(plan))}
            </View>

            {/* Features Comparison */}
            <Animated.View
              style={[
                styles.featuresSection,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <Text style={styles.featuresTitle}>What You Get</Text>
              
              <View style={styles.featuresTable}>
                <View style={styles.featuresHeader}>
                  <View style={styles.featureNameHeader} />
                  <View style={styles.featureColumnHeader}>
                    <Text style={styles.featureColumnHeaderText}>Free</Text>
                  </View>
                  <View style={styles.featureColumnHeader}>
                    <Text style={styles.featureColumnHeaderText}>Premium</Text>
                  </View>
                </View>
                
                {features.map(feature => renderFeature(feature))}
              </View>
            </Animated.View>

            {/* Trial Timeline */}
            <View style={styles.timelineSection}>
              <Text style={styles.timelineTitle1}>Your Trial Timeline</Text>
              
              <View style={styles.timelineContainer}>
                {timelineItems.map(item => renderTimelineItem(item))}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.startTrialButton}
                onPress={handleStartFreeTrial}
                activeOpacity={0.9}
              >
                <Text style={styles.startTrialButtonText}>Start Your Free 30-Days</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    color: '#4A5B87',
    textAlign: 'center',
    lineHeight: 39,
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 35,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  featureIcon: {
    width: 20,
    height: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#A4A4A4',
    borderRadius: 18,
    padding: 2,
    marginBottom: 24,
    alignSelf: 'center',
  },
  billingOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  billingOptionSelected: {
    backgroundColor: '#4A5B87',
    borderRadius: 18,
  },
  billingOptionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Poppins-Medium',
  },
  billingOptionTextSelected: {
    color: '#ffffff',
  },
  pricingSection: {
    marginBottom: 32,
    gap: 30,
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    color: '#4A5B87',
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pricingCardSelected: {
    borderColor: '#3B4F75',
    backgroundColor: '#4A5B87',
  },
  pricingCardPopular: {
    backgroundColor: '#3B4F75',
  },
  badge: {
    position: 'absolute',
    top: -16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
   
  },
  badgeText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'Poppins-Light',
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pricingLeft: {
    flex: 1,
  },
  pricingDuration: {
    fontSize: 20,
    color: '#4A5B87',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  pricingDurationSelected: {
    color: '#ffffff',
  },
  pricingTrial: {
    fontSize: 14,
    color: '#5A5A5A',
    fontFamily: 'Poppins-Light',
  },
  pricingTrialSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pricingRight: {
    alignItems: 'flex-end',
  },
  pricingPrice: {
    fontSize: 24,
    color: '#4A5B87',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  pricingPriceSelected: {
    color: '#ffffff',
  },
  pricingBilling: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  pricingBillingSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featuresTitle: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  featuresTable: {
    gap: 16,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  featureNameHeader: {
    flex: 1,
  },
  featureColumnHeader: {
    width: 80,
    alignItems: 'center',
  },
  featureColumnHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 18,
    fontFamily: 'Poppins-Light',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureName: {
    flex: 1,
    fontSize: 12,
    color: '#00000',
    fontFamily: 'Poppins-Light',
    lineHeight: 18,
  },
  featureColumns: {
    flexDirection: 'row',
  },
  featureColumn: {
    width: 80,
    alignItems: 'center',
  },
  timelineSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timelineTitle: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'left',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  timelineContainer: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timelineIcon: {
    width: 35,
    height: 35,   
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineIconImage: {
    width: 46.6,
    height: 46.5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle1: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  timelineDescription: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
    fontFamily: 'Poppins-Light',
  },
  footer: {
    paddingBottom: 10,
    paddingTop: 24,
  },
  startTrialButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
   
  },
  startTrialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});