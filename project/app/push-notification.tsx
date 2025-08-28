import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    ScrollView,
    Alert,
    Image,
    Platform,
} from 'react-nativ\e';
import { ArrowLeft, Bell, Check, MessageSquare, Heart, Star, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function PushNotificationsScreen() {
    const router = useRouter();
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0.5)).current;
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
            Animated.timing(progressAnim, {
                toValue: 0.5, // 50% progress
                duration: 800,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    const handleBack = () => {
        router.push('/link-account');
    };

    const handleTurnOnNotifications = async () => {
        if (Platform.OS === 'web') {
            Alert.alert(
                'Notifications',
                'Push notifications are not available on web platform. You can still use the app without notifications.',
                [
                    { text: 'Continue', onPress: () => router.push('/moments-selection') }
                ]
            );
            return;
        }

        setIsRequestingPermission(true);

        try {
            const { status } = await Notifications.requestPermissionsAsync();

            if (status === 'granted') {
                Alert.alert(
                    'Notifications Enabled!',
                    'You\'ll now receive gentle reminders and updates about your messages.',
                    [
                        { text: 'Continue', onPress: () => router.push('/moments-selection') }
                    ]
                );
            } else {
                Alert.alert(
                    'Permissions Needed',
                    'To receive reminders, please enable notifications in your device settings. You can still use the app without notifications.',
                    [
                        { text: 'Continue', onPress: () => router.push('/moments-selection') }
                    ]
                );
            }
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            Alert.alert(
                'Error',
                'Failed to setup notifications. You can enable them later in settings.',
                [
                    { text: 'Continue', onPress: () => router.push('/moments-selection') }
                ]
            );
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const handleSkipForNow = () => {
        router.push('/welcome');
    };

    const notificationFeatures = [
        {
            id: '1',
            icon: Check,
            iconColor: '#ffffff',
            iconBackground: '#6099EA',
            text: 'Delivery confirmations',
        },
        {
            id: '2',
            icon: Clock,
            iconColor: '#ffffff',
            iconBackground: '#FCB32B',
            text: 'Message reminders',
        },
        {
            id: '3',
            icon: Heart,
            iconColor: '#ffffff',
            iconBackground: '#FF2828',
            text: 'Custom nudges from your child',
        },
        {
            id: '4',
            icon: Star,
            iconColor: '#ffffff',
            iconBackground: '#8A5FCC',
            text: 'Never miss a moment',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    bounces={true}
                >

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Push Notifications</Text>
                        <View style={styles.headerSpacer} />
                    </View>



                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Main Content */}
                        <View style={styles.mainContent}>
                            {/* Bell Icon */}
                            <Animated.View
                                style={[
                                    styles.iconContainer,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                    }
                                ]}
                            >
                                <View style={styles.bellIcon}>
                                    <Image
                                        source={require('../assets/images/Icon Container.png')}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />              </View>
                            </Animated.View>

                            {/* Main Title */}
                            <Text style={styles.mainTitle}>
                                Stay in the loop with gentle reminders
                            </Text>

                            {/* Description */}
                            <Text style={styles.description}>
                                Get notified when your messages are delivered, when you receive a response or when it's time to schedule a new capsule.
                            </Text>

                            {/* What Notifications Allow Section */}
                            <View style={styles.featuresSection}>

                                <View style={styles.featuresList}>
                                    {notificationFeatures.map((feature, index) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <Animated.View
                                                key={feature.id}
                                                style={[
                                                    styles.featureItem,
                                                    {
                                                        opacity: fadeAnim,
                                                        transform: [
                                                            {
                                                                translateY: slideAnim.interpolate({
                                                                    inputRange: [0, 30],
                                                                    outputRange: [0, 10 + (index * 3)],
                                                                })
                                                            }
                                                        ],
                                                    }
                                                ]}
                                            >
                                                <View style={[
                                                    styles.featureIcon,
                                                    { backgroundColor: feature.iconBackground }
                                                ]}>
                                                    <IconComponent
                                                        size={20}
                                                        color={feature.iconColor}
                                                        strokeWidth={2}
                                                    />
                                                </View>
                                                <Text style={styles.featureText}>{feature.text}</Text>
                                            </Animated.View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.turnOnButton,
                                isRequestingPermission && styles.turnOnButtonDisabled,
                            ]}
                            onPress={handleTurnOnNotifications}
                            disabled={isRequestingPermission}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.turnOnButtonText}>
                                {isRequestingPermission ? 'Setting up...' : 'Turn On Notifications'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkipForNow}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.skipButtonText}>No, I'll Do This Later</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerNote}>
                            You control what we send. Change preferences anytime in Settings.
                        </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 58,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    headerSpacer: {
        width: 40,
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#334155',
        borderRadius: 3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 40,
    },
    bellIcon: {
        width: 80,
        height: 80,
    },
    logoImage: {
        width: 70,
        height: 70
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 20,
        paddingHorizontal: 16,
        fontFamily: 'Poppins-Bold',
    },
    description: {
        fontSize: 14,
        color: '#4A4A4A',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 16,
        fontFamily: 'Poppins-Regular',
    },
    featuresSection: {
        width: '100%',
        marginBottom: 40,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 24,
        fontFamily: 'Poppins-SemiBold',
    },
    featuresList: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    featureText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        flex: 1,
        fontFamily: 'Poppins-Regular',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        gap: 16,
    },
    turnOnButton: {
        backgroundColor: '#334155',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: '#334155',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    turnOnButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
    },
    turnOnButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    skipButton: {
        backgroundColor: '#F59E0B',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    skipButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    footerNote: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
        marginTop: 8,
        fontFamily: 'Poppins-Regular',
    },
});