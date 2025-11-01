import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '@/libs/api';
import { 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Calendar, 
  GraduationCap, 
  Heart,
  ArrowRight,
  Check
} from 'lucide-react-native';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  profile_picture_url?: string;
  username: string;
}

export default function CreateMessageScreen() {
  const params = useLocalSearchParams();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedMessageType, setSelectedMessageType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [vaultActorId, setVaultActorId] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchChildren();
    
    // Set message type from params if provided
    if (params.messageType) {
      setSelectedMessageType(params.messageType as string);
    }

    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refetch children when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [])
  );

  const fetchChildren = async () => {
    try {
      const res = await apiService.getChildProfiles();
      // Backend returns { data: { actors: [...], relationships: [...] } }
      const list = (res as any)?.data?.actors ?? (res as any)?.data ?? [];
      const mapped = list.map((cp: any) => {
        const first = cp.first_name ?? cp.firstName ?? cp.name?.split(' ')[0] ?? '';
        const last = cp.last_name ?? cp.lastName ?? (cp.name?.split(' ').slice(1).join(' ') || '');
        const dob = cp.date_of_birth ?? cp.birthday ?? '';
        return {
          id: cp.id,
          first_name: first,
          last_name: last,
          date_of_birth: dob,
          profile_picture_url: cp.profile_picture_url ?? cp.profilePictureUrl ?? undefined,
          username: cp.username,
        } as Child;
      });
      setChildren(mapped);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChild(childId);
  };

  const handleVaultSelect = () => {
    setSelectedChild('vault');
    setSelectedMessageType('text'); // Default to text for vault messages
  };

  const handleCreateLinkedAccount = () => {
    router.push({
      pathname: '/child-profile-setup',
      params: { returnTo: 'create-message' }
    });
  };

  const handleNext = () => {
    if (selectedChild === 'vault') {
      router.push({
        pathname: '/record-text-message',
        params: {
          childId: vaultActorId,
          messageType: 'text',
          isVaultMessage: 'true'
        }
      });
      return;
    }

    switch (selectedMessageType) {
      case 'text':
        router.push({
          pathname: '/record-text-message',
          params: { childId: selectedChild, messageType: 'text' }
        });
        break;
      case 'audio':
        router.push({
          pathname: '/record-audio-message',
          params: { childId: selectedChild, messageType: 'audio' }
        });
        break;
      case 'video':
        router.push({
          pathname: '/record-video-message',
          params: { childId: selectedChild, messageType: 'video' }
        });
        break;
      default:
        // Fallback to message settings if no type chosen
        router.push({
          pathname: '/message-settings',
          params: { childId: selectedChild }
        });
    }
  };

  const handleSaveForLater = () => {
    router.push('/(tabs)/vault');
  };

  const isFormValid = () => {
    return selectedChild !== '' && (selectedChild === 'vault' || !!selectedMessageType);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipient</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '20%' }]} />
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>Who is this message for?</Text>
        <View style={styles.childrenContainer}>
                {children.map((child) => {
                  const age = calculateAge(child.date_of_birth);
                  const isSelected = selectedChild === child.id;

                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={[
                        styles.childCard,
                        isSelected && styles.childCardSelected,
                      ]}
                      onPress={() => handleChildSelect(child.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.childImageContainer}>
                        <Image
                          source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                          style={styles.childImage}
                          resizeMode="cover"
                        />
                        {isSelected && (
                          <View style={styles.selectedOverlay}>
                            <Check size={20} color="#ffffff" strokeWidth={3} />
                          </View>
                        )}
                      </View>

                      <View style={styles.childInfo}>
                        <Text style={[
                          styles.childName,
                          isSelected && styles.childNameSelected,
                        ]}>
                          {child.first_name}
                        </Text>
                        <Text style={[
                          styles.childAge,
                          isSelected && styles.childAgeSelected,
                        ]}>
                          {age} years old
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

        {/* Save To Vault Option */}
        <TouchableOpacity
          style={[
            styles.vaultCard,
            selectedChild === 'vault' && styles.vaultCardSelected
          ]}
          onPress={handleVaultSelect}
        >
          <View style={styles.vaultIconContainer}>
            <MessageCircle size={24} color="#fff" />
          </View>
          <View style={styles.vaultContent}>
            <Text style={styles.vaultTitle}>Save To Vault</Text>
            <Text style={styles.vaultDescription}>
              Store this message privately until you're ready to share.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Children List or No Linked Accounts */}
          {/* {children.length === 0 ? (
            <View style={styles.noAccountsCard}>
              <View style={styles.noAccountsIconContainer}>
              <Image source={require('../assets/images/linked-acct.png')} style={styles.noAccountsIcon} />
              </View>
              <Text style={styles.noAccountsTitle}>No Linked accounts yet</Text>
              <Text style={styles.noAccountsDescription}>
                Start building connections by linking your loved one's account.
              </Text>
              
              <Text style={styles.unlockTitle}>Linking unlocks:</Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Calendar size={20} color="#3B82F6" />
                  <Text style={styles.benefitText}>
                    Schedule message to deliver for future dates
                  </Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <GraduationCap size={20} color="#F59E0B" />
                  <Text style={styles.benefitText}>
                    Milestone & "Open When" triggers
                  </Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Heart size={20} color="#EF4444" />
                  <Text style={styles.benefitText}>
                    Instant emotional support delivery
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={handleCreateLinkedAccount}
              >
                <Text style={styles.createAccountButtonText}>
                  Create Linked Account
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.childrenContainer}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childCard,
                    selectedChild === child.id && styles.childCardSelected
                  ]}
                  onPress={() => handleChildSelect(child.id)}
                >
                  <Image
                    source={{ 
                      uri: child.profile_picture_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
                    }}
                    style={styles.childAvatar}
                  />
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.first_name}</Text>
                    <Text style={styles.childAge}>Age {calculateAge(child.date_of_birth)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )} */}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormValid() && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!isFormValid()}
          >
            <Text style={styles.nextButtonText}>Next, Record Message</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
          
          {children.length > 0 && (
            <TouchableOpacity
              style={styles.saveForLaterButton}
              onPress={handleSaveForLater}
            >
              <Text style={styles.saveForLaterText}>Save For Later</Text>
            </TouchableOpacity>
          )}
        </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  animatedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2F3A56',
    borderRadius: 2,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  vaultCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultCardSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  vaultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vaultContent: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vaultDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noAccountsCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 30,
    backgroundColor: '#FBF9FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noAccountsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
   
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noAccountsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noAccountsDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  unlockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  benefitsList: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  createAccountButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  childrenContainer: {
    paddingHorizontal: 20,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childCardSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#8B5CF6',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  saveForLaterButton: {
    alignItems: 'center',
  },
  saveForLaterText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  noAccountsIcon: {
    width: 80,
    height: 80,
  },

  childImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 79, 117, 0.8)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  childNameSelected: {
    color: '#3B4F75',
  },
  
  childAgeSelected: {
    color: '#3B4F75',
  },
  messageTypesContainer: {
    gap: 16,
  },
  messageTypeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  messageTypeEmoji: {
    fontSize: 24,
  },
  messageTypeLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});