import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  Modal,
  TextInput,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Clock, Info, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';

type DeliveryOption = 'specific' | 'openWhen' | 'sendNow' | 'saveLater';
type ReminderOption = '5min' | '1day' | '1week' | 'custom';
type OpenWhenCategory = 'milestones' | 'emotional' | 'celebrations';

interface MilestoneTag {
  id: string;
  label: string;
  emoji: string;
  category: OpenWhenCategory;
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ScheduleDelivery() {
  const router = useRouter();
  const {
    childId,
    messageType,
    recordedUri,
    messageTitle,
    privacy,
    tags,
    promptText,
    imageUri,
  } = useLocalSearchParams();
  
  const [selectedOption, setSelectedOption] = useState<DeliveryOption>('specific');
  const [expandedOption, setExpandedOption] = useState<DeliveryOption | null>('specific');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderOption>('5min');

  const [selectedCategory, setSelectedCategory] = useState<OpenWhenCategory>('milestones');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTagName, setCustomTagName] = useState('');
  const [customTagEmoji, setCustomTagEmoji] = useState('');

  const milestoneTags: MilestoneTag[] = [
    { id: 'first-game', label: 'First Big Game / Performance', emoji: '🎂', category: 'milestones' },
    { id: 'first-dance', label: 'First School Dance', emoji: '🎓', category: 'milestones' },
    { id: 'first-day', label: 'First Day Of School/Job', emoji: '🏫', category: 'milestones' },
    { id: 'first-car', label: 'First Car', emoji: '🚗', category: 'milestones' },
    { id: 'sweet-16', label: 'Sweet 16', emoji: '🎉', category: 'milestones' },
    { id: 'graduation', label: 'Graduation Day', emoji: '🎓', category: 'milestones' },
    { id: 'first-job', label: 'First Job', emoji: '💼', category: 'milestones' },
    { id: 'wedding', label: 'Wedding Day', emoji: '💍', category: 'milestones' },
  ];

  const emotionalTags: MilestoneTag[] = [
    { id: 'feeling-sad', label: 'Feeling Sad', emoji: '😢', category: 'emotional' },
    { id: 'feeling-anxious', label: 'Feeling Anxious', emoji: '😰', category: 'emotional' },
    { id: 'feeling-stressed', label: 'Feeling Stressed', emoji: '😓', category: 'emotional' },
    { id: 'need-courage', label: 'Need Courage', emoji: '💪', category: 'emotional' },
    { id: 'heartbroken', label: 'Heartbroken', emoji: '💔', category: 'emotional' },
    { id: 'need-motivation', label: 'Need Motivation', emoji: '🌟', category: 'emotional' },
    { id: 'lonely', label: 'Feeling Lonely', emoji: '🤗', category: 'emotional' },
    { id: 'overwhelmed', label: 'Feeling Overwhelmed', emoji: '😵', category: 'emotional' },
  ];

  const celebrationTags: MilestoneTag[] = [
    { id: 'birthday', label: 'Birthday', emoji: '🎂', category: 'celebrations' },
    { id: 'holiday', label: 'Holiday', emoji: '🎄', category: 'celebrations' },
    { id: 'achievement', label: 'Big Achievement', emoji: '🏆', category: 'celebrations' },
    { id: 'promotion', label: 'Promotion', emoji: '📈', category: 'celebrations' },
    { id: 'new-home', label: 'New Home', emoji: '🏡', category: 'celebrations' },
    { id: 'engagement', label: 'Engagement', emoji: '💍', category: 'celebrations' },
  ];

  const getTagsByCategory = (): MilestoneTag[] => {
    switch (selectedCategory) {
      case 'milestones':
        return milestoneTags;
      case 'emotional':
        return emotionalTags;
      case 'celebrations':
        return celebrationTags;
      default:
        return milestoneTags;
    }
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (time: Date) => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const [isChevronPressed, setIsChevronPressed] = useState(false);

  const handleSelectOption = (option: DeliveryOption) => {
    // Don't select if chevron was just pressed
    if (isChevronPressed) {
      setIsChevronPressed(false);
      return;
    }
    
    setSelectedOption(option);
    // Collapse any expanded card when selecting a non-expandable option
    if (option === 'sendNow' || option === 'saveLater') {
      if (expandedOption !== null) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedOption(null);
      }
    }
  };

  const toggleExpand = (option: DeliveryOption) => {
    setIsChevronPressed(true);
    
    // Only 'specific' and 'openWhen' are expandable
    if (option === 'sendNow' || option === 'saveLater') {
      return;
    }
    
    // Configure smooth animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Accordion behavior: if clicking the same card, collapse it; otherwise, expand the clicked card
    if (expandedOption === option) {
      setExpandedOption(null);
    } else {
      setExpandedOption(option);
      // When expanding, also select the card
      setSelectedOption(option);
    }
    
    // Reset flag after a short delay
    setTimeout(() => setIsChevronPressed(false), 100);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddCustomTag = () => {
    if (customTagName.trim()) {
      const customId = `custom-${Date.now()}`;
      setSelectedTags(prev => [...prev, customId]);
      setCustomTagName('');
      setCustomTagEmoji('');
      setShowCustomModal(false);
    }
  };

  const handleNext = () => {
    // Prepare delivery option and scheduled date/time based on selected option
    let deliveryOption = 'now';
    let scheduledDate = '';
    let scheduledTime = '';
    let repeatAnnually = 'false';
    let lifeMomentDescription = '';
    let reminderOption = '';

    if (selectedOption === 'specific') {
      deliveryOption = 'specificDate';
      scheduledDate = formatDate(date);
      scheduledTime = formatTime(time);
      if (reminderEnabled) {
        reminderOption = selectedReminder;
      }
    } else if (selectedOption === 'openWhen') {
      deliveryOption = 'lifeMoment';
      // Get selected tags descriptions
      const allTags = [...milestoneTags, ...emotionalTags, ...celebrationTags];
      const selectedTagLabels = selectedTags
        .map(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          return tag ? tag.label : '';
        })
        .filter(Boolean);
      lifeMomentDescription = selectedTagLabels.join(', ') || 'Custom trigger';
    } else if (selectedOption === 'sendNow') {
      deliveryOption = 'now';
    } else if (selectedOption === 'saveLater') {
      deliveryOption = 'manuallyLater';
    }

    router.push({
      pathname: '/final-review',
      params: {
        childId: childId as string,
        messageType: messageType as string,
        recordedUri: (imageUri || recordedUri) as string,
        messageTitle: messageTitle as string,
        privacy: privacy as string,
        tags: tags as string,
        promptText: promptText as string,
        deliveryOption,
        scheduledDate,
        scheduledTime,
        repeatAnnually,
        lifeMomentDescription,
        reminderOption,
      }
    });
  };

  const renderReminderOptions = () => {
    if (!reminderEnabled) return null;

    const options: { label: string; value: ReminderOption }[] = [
      { label: '5 minutes before', value: '5min' },
      { label: '1 day before', value: '1day' },
      { label: '1 week before', value: '1week' },
      { label: 'Custom', value: 'custom' },
    ];

    return (
      <View style={styles.reminderOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.reminderOption}
            onPress={() => setSelectedReminder(option.value)}
          >
            <View
              style={[
                styles.radioButton,
                selectedReminder === option.value && styles.radioButtonSelected,
              ]}
            />
            <Text style={styles.reminderOptionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOpenWhenContent = () => {
    if (expandedOption !== 'openWhen') return null;

    const currentTags = getTagsByCategory();

    return (
      <View style={styles.cardContent}>
        <Text style={styles.cardDescription}>
          Choose when this message should be unlocked...
        </Text>

        <View style={styles.categoryTabs}>
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'milestones' && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory('milestones')}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === 'milestones' && styles.categoryTabTextActive,
              ]}
            >
              Milestones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'emotional' && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory('emotional')}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === 'emotional' && styles.categoryTabTextActive,
              ]}
            >
              Emotional Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'celebrations' && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory('celebrations')}
          >
            <Text style={styles.categoryTabEmoji}>🎉</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsGrid}>
          {currentTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagCard,
                selectedTags.includes(tag.id) && styles.tagCardSelected,
              ]}
              onPress={() => handleTagToggle(tag.id)}
            >
              <Text style={styles.tagEmoji}>{tag.emoji}</Text>
              <Text
                style={[
                  styles.tagLabel,
                  selectedTags.includes(tag.id) && styles.tagLabelSelected,
                ]}
              >
                {tag.label}
              </Text>
              {selectedTags.includes(tag.id) && (
                <View style={styles.tagCheckmark}>
                  <Text style={styles.tagCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addCustomCard}
            onPress={() => setShowCustomModal(true)}
          >
            <Plus size={24} color="#5B7FFF" strokeWidth={2} />
            <Text style={styles.addCustomText}>Add Custom</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Message</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Choose how you want this message delivered.
        </Text>

        <TouchableOpacity
          style={[
            styles.card,
            selectedOption === 'specific' && styles.cardSelected,
          ]}
          onPress={() => handleSelectOption('specific')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.radioOuter}>
              {selectedOption === 'specific' && <View style={styles.radioInner} />}
            </View>
            <Calendar size={20} color="#5B7FFF" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Send by Specific Date or Time</Text>
            <TouchableOpacity
              onPress={() => {
                toggleExpand('specific');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {expandedOption === 'specific' ? (
                <ChevronUp size={20} color="#666" style={{ marginLeft: 8 }} />
              ) : (
                <ChevronDown size={20} color="#666" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          </View>

          {expandedOption === 'specific' && (
            <View style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Select the date and time this message should be delivered.
              </Text>

              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeColumn}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.inputText}>{formatDate(date)}</Text>
                    <Calendar size={20} color="#5B7FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeColumn}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.inputText}>{formatTime(time)}</Text>
                    <Clock size={20} color="#5B7FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}

              <View style={styles.timezoneNote}>
                <Info size={16} color="#666" />
                <Text style={styles.timezoneText}>
                  Time will be sent according on recipient's local timezone
                </Text>
              </View>

              <View style={styles.reminderSection}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>Set Reminder Notification</Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                    thumbColor={reminderEnabled ? '#5B7FFF' : '#F3F4F6'}
                  />
                </View>
                <Text style={styles.reminderSubtext}>
                  Would you like a reminder before this message sends?
                </Text>
                {renderReminderOptions()}
              </View>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedOption === 'openWhen' && styles.cardSelected,
          ]}
          onPress={() => handleSelectOption('openWhen')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.radioOuter}>
              {selectedOption === 'openWhen' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.cardIcon}>😊</Text>
            <Text style={styles.cardTitle}>Open When...</Text>
            <TouchableOpacity
              onPress={() => {
                toggleExpand('openWhen');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {expandedOption === 'openWhen' ? (
                <ChevronUp size={20} color="#666" style={{ marginLeft: 8 }} />
              ) : (
                <ChevronDown size={20} color="#666" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          </View>
          {renderOpenWhenContent()}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedOption === 'sendNow' && styles.cardSelected,
          ]}
          onPress={() => handleSelectOption('sendNow')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.radioOuter}>
              {selectedOption === 'sendNow' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.cardIcon}>🚀</Text>
            <Text style={styles.cardTitle}>Send Now</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            selectedOption === 'saveLater' && styles.cardSelected,
          ]}
          onPress={() => handleSelectOption('saveLater')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.radioOuter}>
              {selectedOption === 'saveLater' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>Save For Later</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next, Final Review</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Tag</Text>
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Tag Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., First Concert"
                value={customTagName}
                onChangeText={setCustomTagName}
                autoFocus
              />

              <Text style={styles.modalLabel}>Emoji (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="🎵"
                value={customTagEmoji}
                onChangeText={setCustomTagEmoji}
                maxLength={2}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  !customTagName.trim() && styles.modalSaveButtonDisabled,
                ]}
                onPress={handleAddCustomTag}
                disabled={!customTagName.trim()}
              >
                <Text style={styles.modalSaveText}>Add Tag</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#5B7FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5B7FFF',
  },
  cardIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  arrow: {
    color: '#FFF',
    fontSize: 20,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  timezoneNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  timezoneText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  reminderSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  reminderSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  reminderOptions: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  radioButtonSelected: {
    backgroundColor: '#5B7FFF',
  },
  reminderOptionText: {
    fontSize: 14,
    color: '#333',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#2C3E5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B7FFF',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#5B7FFF',
    fontWeight: '600',
  },
  categoryTabEmoji: {
    fontSize: 16,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  tagCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#5B7FFF',
  },
  tagEmoji: {
    fontSize: 32,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  tagLabelSelected: {
    color: '#5B7FFF',
    fontWeight: '600',
  },
  tagCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagCheckmarkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addCustomCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#5B7FFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  addCustomText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5B7FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
