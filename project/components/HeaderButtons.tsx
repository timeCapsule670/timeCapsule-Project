import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface HeaderButtonsProps {
  onBack?: () => void;
  onSkip?: () => void;
  backText?: string;
  skipText?: string;
  showBack?: boolean;
  showSkip?: boolean;
}

export default function HeaderButtons({
  onBack,
  onSkip,
  backText = 'Back',
  skipText = 'Skip',
  showBack = true,
  showSkip = true,
}: HeaderButtonsProps) {
  return (
    <View style={styles.header}>
      {showBack && onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#64748B" strokeWidth={2} />
          <Text style={styles.backText}>{backText}</Text>
        </TouchableOpacity>
      )}
      
      {!showBack && <View style={styles.placeholder} />}
      
      {showSkip && onSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>{skipText}</Text>
        </TouchableOpacity>
      )}
      
      {!showSkip && <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 18,
    color: '#777777',
    marginLeft: 8,
    fontWeight: '700',
    lineHeight: 27,
    fontFamily: 'Poppins-Regular',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 18,
    color: '#777777',
    fontWeight: '700',
    lineHeight: 27,
    fontFamily: 'Poppins-Regular',
  },
  placeholder: {
    width: 60, // Approximate width of button to maintain spacing
  },
});
