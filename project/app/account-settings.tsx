import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  Trash2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/superbase';

interface NotificationSettings {
  messageReminders: boolean;
  viewNotifications: boolean;
  promptSuggestions: boolean;
}

interface MessageSettings {
  defaultMessageType: 'video' | 'audio' | 'text';
  shareWithFamilyGroup: boolean;
  childCanSeeSenderName: boolean;
  allowChildToRespond: boolean;
}

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    messageReminders: true,
    viewNotifications: true,
    promptSuggestions: true,
  });
  const [messageSettings, setMessageSettings] = useState<MessageSettings>({
    defaultMessageType: 'video',
    shareWithFamilyGroup: true,
    childCanSeeSenderName: true,
    allowChildToRespond: true,
  });
  const [showMessageTypeModal, setShowMessageTypeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLinkedChildProfile = () => {
    Alert.alert('Linked Child Profile', 'Child profile management feature coming soon!');
  };

  const handleManageFamilyGroup = () => {
    Alert.alert('Manage Family Group', 'Family group management feature coming soon!');
  };

  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleMessageSettingToggle = (setting: keyof MessageSettings) => {
    if (setting === 'defaultMessageType') return; // Handle separately
    setMessageSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleMessageTypeSelect = (type: 'video' | 'audio' | 'text') => {
    setMessageSettings(prev => ({
      ...prev,
      defaultMessageType: type,
    }));
    setShowMessageTypeModal(false);
  };

  const handleViewMessageHistory = () => {
    Alert.alert('Message History', 'Message history feature coming soon!');
  };

  const handleHelpCenter = () => {
    Alert.alert('Help Center', 'Help center feature coming soon!');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy feature coming soon!');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service feature coming soon!');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to log out. Please try again.');
        return;
      }
      
      setShowLogoutModal(false);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    Alert.alert(
      'Account Deletion',
      'Account deletion feature will be available soon. Please contact support for assistance.',
      [{ text: 'OK' }]
    );
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'text':
        return 'Text';
      default:
        return 'Video';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Linked Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleLinkedChildProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Linked Child Profile</Text>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleManageFamilyGroup}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Manage Family Group</Text>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Message Reminders</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={notificationSettings.messageReminders ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleNotificationToggle('messageReminders')}
                value={notificationSettings.messageReminders}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>View Notifications</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={notificationSettings.viewNotifications ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleNotificationToggle('viewNotifications')}
                value={notificationSettings.viewNotifications}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Prompt Suggestions</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={notificationSettings.promptSuggestions ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleNotificationToggle('promptSuggestions')}
                value={notificationSettings.promptSuggestions}
              />
            </View>
          </View>
        </View>

        {/* Message Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Settings</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingColumn}>
              <Text style={styles.settingSubtitle}>Default Message type</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMessageTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>
                  {getMessageTypeLabel(messageSettings.defaultMessageType)}
                </Text>
                <ChevronDown size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Share with family group</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={messageSettings.shareWithFamilyGroup ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleMessageSettingToggle('shareWithFamilyGroup')}
                value={messageSettings.shareWithFamilyGroup}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Child can see sender name</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={messageSettings.childCanSeeSenderName ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleMessageSettingToggle('childCanSeeSenderName')}
                value={messageSettings.childCanSeeSenderName}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Allow child to respond</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                thumbColor={messageSettings.allowChildToRespond ? '#ffffff' : '#f4f3f4'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleMessageSettingToggle('allowChildToRespond')}
                value={messageSettings.allowChildToRespond}
              />
            </View>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleViewMessageHistory}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>View Message History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Legal Section */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleHelpCenter}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Help Center</Text>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handlePrivacyPolicy}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleTermsOfService}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Terms Of Service</Text>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Message Type Selection Modal */}
      <Modal
        visible={showMessageTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMessageTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Default Message Type</Text>
            <Text style={styles.modalDescription}>
              Choose your preferred message type for new messages.
            </Text>

            <View style={styles.messageTypeOptions}>
              {[
                { value: 'video', label: 'Video', emoji: '🎥' },
                { value: 'audio', label: 'Audio', emoji: '🎙️' },
                { value: 'text', label: 'Text', emoji: '✍️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.messageTypeOption,
                    messageSettings.defaultMessageType === option.value && styles.messageTypeOptionSelected,
                  ]}
                  onPress={() => handleMessageTypeSelect(option.value as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.messageTypeEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.messageTypeLabel,
                    messageSettings.defaultMessageType === option.value && styles.messageTypeLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowMessageTypeModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out of your account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDescription}>
              This action cannot be undone. All your messages and data will be permanently deleted.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDeleteAccount}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingColumn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  settingSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  linkRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Poppins-Regular',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  actionButtons: {
    gap: 16,
  },
  logoutButton: {
    backgroundColor: '#6B7280',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6B7280',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  messageTypeOptions: {
    gap: 12,
    marginBottom: 24,
  },
  messageTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 16,
  },
  messageTypeOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
  },
  messageTypeEmoji: {
    fontSize: 24,
  },
  messageTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  messageTypeLabelSelected: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#6B7280',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
});