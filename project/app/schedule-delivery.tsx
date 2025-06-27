import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Clock, Circle, CheckCircle, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ScheduleDeliveryScreen() {
  const router = useRouter();
  const { childId, messageType, recordedUri, messageTitle, privacy, tags, promptText } = useLocalSearchParams();

  const [deliveryOption, setDeliveryOption] = useState<'specificDate' | 'lifeMoment' | 'manuallyLater'>('specificDate');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [repeatAnnually, setRepeatAnnually] = useState(false);
  const [lifeMomentDescription, setLifeMomentDescription] = useState('');
  const [reminderOption, setReminderOption] = useState<'none' | '3days' | '1week'>('none');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleBack = () => {
    router.back();
  };

  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    const currentDate = date || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const onTimeChange = (event: DateTimePickerEvent, time?: Date) => {
    const currentTime = time || selectedTime;
    setShowTimePicker(Platform.OS === 'ios');
    setSelectedTime(currentTime);
  };

  const showDatepicker = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Date Picker', 'Date picker is not available on web. Please use the text input format MM/DD/YYYY.');
      return;
    }
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Time Picker', 'Time picker is not available on web. Please use the text input format HH:MM AM/PM.');
      return;
    }
    setShowTimePicker(true);
  };

  const handlePreviewMessage = () => {
    if (deliveryOption === 'specificDate' && (!selectedDate || !selectedTime)) {
      Alert.alert('Missing Information', 'Please select a date and time for delivery.');
      return;
    }
    if (deliveryOption === 'lifeMoment' && !lifeMomentDescription.trim()) {
      Alert.alert('Missing Information', 'Please describe the life moment.');
      return;
    }

    router.push({
      pathname: '/preview-message',
      params: {
        childId: childId,
        messageType: messageType,
        recordedUri: recordedUri,
        messageTitle: messageTitle,
        privacy: privacy,
        tags: tags,
        promptText: promptText,
        deliveryOption: deliveryOption,
        scheduledDate: deliveryOption === 'specificDate' ? formatDate(selectedDate) : '',
        scheduledTime: deliveryOption === 'specificDate' ? formatTime(selectedTime) : '',
        repeatAnnually: deliveryOption === 'specificDate' ? repeatAnnually.toString() : 'false',
        lifeMomentDescription: deliveryOption === 'lifeMoment' ? lifeMomentDescription.trim() : '',
        reminderOption: reminderOption,
      },
    });
  };

  const renderRadioButton = (optionValue: string, label: string) => {
    const isSelected = deliveryOption === optionValue;
    const IconComponent = isSelected ? CheckCircle : Circle;
    return (
      <TouchableOpacity
        style={styles.radioOption}
        onPress={() => setDeliveryOption(optionValue as any)}
        activeOpacity={0.7}
      >
        <IconComponent size={24} color={isSelected ? '#3B4F75' : '#9CA3AF'} strokeWidth={2} />
        <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderReminderButton = (optionValue: string, label: string) => {
    const isSelected = reminderOption === optionValue;
    return (
      <TouchableOpacity
        style={[styles.reminderButton, isSelected && styles.reminderButtonSelected]}
        onPress={() => setReminderOption(optionValue as any)}
        activeOpacity={0.7}
      >
        <Text style={[styles.reminderButtonText, isSelected && styles.reminderButtonTextSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderDateTimeInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.specificDateInputs}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputText}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              value={formatDate(selectedDate)}
              onChangeText={(text) => {
                // Simple date parsing for web
                const parts = text.split('/');
                if (parts.length === 3) {
                  const month = parseInt(parts[0], 10) - 1;
                  const day = parseInt(parts[1], 10);
                  const year = parseInt(parts[2], 10);
                  if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                    setSelectedDate(new Date(year, month, day));
                  }
                }
              }}
            />
            <Calendar size={20} color="#64748B" />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputText}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="#9CA3AF"
              value={formatTime(selectedTime)}
              onChangeText={(text) => {
                // Simple time parsing for web
                const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
                const match = text.match(timeRegex);
                if (match) {
                  let hours = parseInt(match[1], 10);
                  const minutes = parseInt(match[2], 10);
                  const period = match[3].toUpperCase();
                  
                  if (period === 'PM' && hours !== 12) hours += 12;
                  if (period === 'AM' && hours === 12) hours = 0;
                  
                  const newTime = new Date();
                  newTime.setHours(hours, minutes, 0, 0);
                  setSelectedTime(newTime);
                }
              }}
            />
            <Clock size={20} color="#64748B" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.specificDateInputs}>
        <TouchableOpacity style={styles.inputWrapper} onPress={showDatepicker} activeOpacity={0.7}>
          <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
          <Calendar size={20} color="#64748B" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.inputWrapper} onPress={showTimepicker} activeOpacity={0.7}>
          <Text style={styles.inputText}>{formatTime(selectedTime)}</Text>
          <Clock size={20} color="#64748B" />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </View>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Delivery</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When should your message be delivered?</Text>
            <Text style={styles.sectionSubtitle}>Choose a moment that matters most. You can change this later.</Text>

            <View style={styles.deliveryOptionsContainer}>
              <View style={styles.deliveryOptionCard}>
                {renderRadioButton('specificDate', 'On a Specific Date')}
                <Text style={styles.deliveryOptionDescription}>Perfect for birthdays, holidays, or milestones.</Text>
                {deliveryOption === 'specificDate' && (
                  <View style={styles.specificDateContainer}>
                    {renderDateTimeInput()}
                    <View style={styles.repeatAnnuallyContainer}>
                      <Text style={styles.repeatAnnuallyText}>Repeat every year</Text>
                      <Switch
                        trackColor={{ false: '#E5E7EB', true: '#3B4F75' }}
                        thumbColor={repeatAnnually ? '#ffffff' : '#f4f3f4'}
                        ios_backgroundColor="#E5E7EB"
                        onValueChange={setRepeatAnnually}
                        value={repeatAnnually}
                      />
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.deliveryOptionCard}>
                {renderRadioButton('lifeMoment', 'Triggered by a Life Moment')}
                <Text style={styles.deliveryOptionDescription}>Tell us the life moment, we'll do the rest. (E.G. When they are feeling sad)</Text>
                {deliveryOption === 'lifeMoment' && (
                  <TextInput
                    style={styles.lifeMomentInput}
                    placeholder="Life moment"
                    placeholderTextColor="#9CA3AF"
                    value={lifeMomentDescription}
                    onChangeText={setLifeMomentDescription}
                    multiline
                  />
                )}
              </View>

              <View style={styles.deliveryOptionCard}>
                {renderRadioButton('manuallyLater', 'I\'ll send it Manually Later')}
                <Text style={styles.deliveryOptionDescription}>Save it in your vault to send when the moment feels right.</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Would you like us to remind you before this message is sent?</Text>
            <View style={styles.reminderOptionsContainer}>
              {renderReminderButton('3days', 'Yes, remind 3 days before')}
              {renderReminderButton('1week', 'Yes, remind 1 week before')}
              {renderReminderButton('none', 'No reminder needed')}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreviewMessage}
            activeOpacity={0.9}
          >
            <Text style={styles.previewButtonText}>Preview Message</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 30
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
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  deliveryOptionsContainer: {
    gap: 16,
  },
  deliveryOptionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
    fontFamily: 'Poppins-Medium',
  },
  radioLabelSelected: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  deliveryOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 36,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  specificDateContainer: {
    marginLeft: 36,
  },
  specificDateInputs: {
    gap: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  repeatAnnuallyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  repeatAnnuallyText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  lifeMomentInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    marginLeft: 36,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reminderOptionsContainer: {
    gap: 12,
  },
  reminderButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
    shadowColor: '#3B4F75',
    shadowOpacity: 0.15,
  },
  reminderButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  reminderButtonTextSelected: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previewButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  previewButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});