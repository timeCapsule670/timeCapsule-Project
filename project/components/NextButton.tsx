import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface NextButtonProps {
  onPress: () => void;
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function NextButton({
  onPress,
  text = 'Next',
  disabled = false,
  loading = false,
  variant = 'primary',
}: NextButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        loading && styles.loading,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {loading ? 'Loading...' : text}
      </Text>
      <ArrowLeft
        size={20}
        color={variant === 'primary' ? '#ffffff' : '#334155'}
        strokeWidth={2}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  primary: {
    backgroundColor: '#2F3A56',
  },
  secondary: {
    backgroundColor: '#FCB32B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  loading: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#334155',
  },
  arrow: {
    transform: [{ rotate: '180deg' }],
  },
});
