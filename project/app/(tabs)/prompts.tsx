import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Bot,
  Bookmark,
  Edit,
  Smile,
  GraduationCap,
  Check,
  PartyPopper,
  MessageSquare,
  Heart,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface PromptCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  backgroundColor: string;
}

interface PromptCard {
  id: string;
  text: string;
  tags: string[];
  category: string;
}

export default function PromptsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('emotional-support');

  const categories: PromptCategory[] = [
    {
      id: 'emotional-support',
      label: 'Emotional Support',
      emoji: '😊',
      color: '#000000',
      backgroundColor: '#D6C7ED',
    },
    {
      id: 'milestones',
      label: 'Milestones',
      emoji: '🎓',
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
    },
    {
      id: 'celebrations',
      label: 'Celebrations',
      emoji: '🎉',
      color: '#EC4899',
      backgroundColor: '#FCE7F3',
    },
    {
      id: 'life-advice',
      label: 'Life Advice',
      emoji: '💬',
      color: '#3B82F6',
      backgroundColor: '#DBEAFE',
    },
    {
      id: 'just-because',
      label: 'Just Because',
      emoji: '❤️',
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
    },
  ];

  const prompts: PromptCard[] = [
    {
      id: '1',
      text: 'If you\'re having a hard day, I want you to hear this from me...',
      tags: ['#EmotionalSupport', '#VoiceMessage'],
      category: 'emotional-support',
    },
    {
      id: '2',
      text: 'When it feels like no one understands you, remember this...',
      tags: ['#EmotionalSupport', '#VoiceMessage'],
      category: 'emotional-support',
    },
    {
      id: '3',
      text: 'On your graduation day, I want to tell you how proud I am...',
      tags: ['#Milestones', '#VideoMessage'],
      category: 'milestones',
    },
    {
      id: '4',
      text: 'Happy Birthday! Here\'s a little something to make you smile...',
      tags: ['#Celebrations', '#TextMessage'],
      category: 'celebrations',
    },
    {
      id: '5',
      text: 'A piece of advice I wish I had known when I was your age...',
      tags: ['#LifeAdvice', '#AudioMessage'],
      category: 'life-advice',
    },
    {
      id: '6',
      text: 'Just thinking of you and sending some love your way.',
      tags: ['#JustBecause', '#TextMessage'],
      category: 'just-because',
    },
  ];

  const filteredPrompts = prompts.filter(
    (prompt) => prompt.category === selectedCategory
  );

  const handleBack = () => {
    router.back();
  };

  const handleGenerateAI = () => {
    console.log('Generate AI prompts');
    // Logic for AI generation
  };

  const handleUsePrompt = (promptId: string) => {
    console.log('Using prompt:', promptId);
    // Logic to use the selected prompt
  };

  const handleEditPrompt = (promptId: string) => {
    console.log('Editing prompt:', promptId);
    // Logic to edit the selected prompt
  };

  const handleBookmarkPrompt = (promptId: string) => {
    console.log('Bookmarking prompt:', promptId);
    // Logic to bookmark the selected prompt
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Prompts Page</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Suggested Prompts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Prompts</Text>
            <Text style={styles.sectionSubtitle}>
              Let's help you find the right words for the right moment.
            </Text>
          </View>

          {/* AI Generation Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardContent}>
              <Text style={styles.aiCardTitle}>Need a little help?</Text>
              <Text style={styles.aiCardDescription}>
                Let our AI assistant guide you with custom prompt ideas.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateAI}
              activeOpacity={0.8}
            >
              <Bot size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.generateButtonText}>Generate</Text>
            </TouchableOpacity>
          </View>

          {/* Categories ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && {
                    backgroundColor: category.backgroundColor,
                    borderColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && { color: category.color },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prompt Cards */}
          <View style={styles.promptsList}>
            {filteredPrompts.map((prompt) => (
              <View key={prompt.id} style={styles.promptCard}>
                <View style={styles.promptCardHeader}>
                  <Text style={styles.promptCardText}>{prompt.text}</Text>
                  <TouchableOpacity
                    onPress={() => handleBookmarkPrompt(prompt.id)}
                    activeOpacity={0.7}
                  >
                    <Bookmark size={20} color="#9CA3AF" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <View style={styles.promptCardTags}>
                  {prompt.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.promptCardActions}>
                  <TouchableOpacity
                    style={styles.usePromptButton}
                    onPress={() => handleUsePrompt(prompt.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.usePromptButtonText}>Use Prompt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editPromptButton}
                    onPress={() => handleEditPrompt(prompt.id)}
                    activeOpacity={0.7}
                  >
                    <Edit size={20} color="#6B7280" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Need More Ideas Section */}
          <View style={styles.moreIdeasCard}>
            <Text style={styles.moreIdeasTitle}>💡 Need more ideas?</Text>
            <View style={styles.moreIdeasChecklist}>
              <View style={styles.moreIdeasChecklistItem}>
                <Check size={16} color="#8B5CF6" strokeWidth={3} />
                <Text style={styles.moreIdeasChecklistText}>"Their first day of high school"</Text>
              </View>
              <View style={styles.moreIdeasChecklistItem}>
                <Check size={16} color="#8B5CF6" strokeWidth={3} />
                <Text style={styles.moreIdeasChecklistText}>"Handling a tough friendship"</Text>
              </View>
              <View style={styles.moreIdeasChecklistItem}>
                <Check size={16} color="#8B5CF6" strokeWidth={3} />
                <Text style={styles.moreIdeasChecklistText}>"Why I believe in you"</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
    paddingTop: 50,
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
    color: '#5A5A5A',
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
    paddingBottom: 100, // Extra padding for tab bar
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  aiCard: {
    backgroundColor: '#A3C4F3',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardContent: {
    flex: 1,
    marginRight: 16,
  },
  aiCardTitle: {
    fontSize: 18,
    color: '#2F3A56',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  aiCardDescription: {
    fontSize: 14,
    color: '#2F3A56',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  generateButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2F3A56',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  categoriesScrollView: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  categoriesContainer: {
    gap: 12,
    paddingRight: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter-SemiBold',
  },
  promptsList: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promptCardText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginRight: 12,
    fontFamily: 'Inter-Regular',
  },
  promptCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#D6C7ED',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'Inter-Regular',
  },
  promptCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usePromptButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  usePromptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  editPromptButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moreIdeasCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moreIdeasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6D28D9',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  moreIdeasChecklist: {
    gap: 12,
  },
  moreIdeasChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreIdeasChecklistText: {
    fontSize: 14,
    color: '#6D28D9',
    fontFamily: 'Poppins-Regular',
  },
});

