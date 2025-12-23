import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { ChevronLeft, X, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const WriteQuestionScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().replace(/^#/, '');
        if (!trimmedTag) {
            setTagInput('');
            return;
        }

        if (tags.length >= 5) {
            Alert.alert('알림', '해시태그는 최대 5개까지만 추가할 수 있습니다.');
            return;
        }

        if (tags.includes(trimmedTag)) {
            Alert.alert('알림', '이미 추가된 태그입니다.');
            setTagInput('');
            return;
        }

        setTags([...tags, trimmedTag]);
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleComplete = () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
            return;
        }

        // 실제 구현에서는 여기서 데이터 저장 로직 수행
        Alert.alert('성공', '질문이 등록되었습니다.', [
            { text: '확인', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>질문하기</Text>
                <TouchableOpacity onPress={handleComplete} style={styles.completeButton}>
                    <Text style={styles.completeButtonText}>완료</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 + insets.top : 20}
            >
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>제목</Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="제목을 입력하세요"
                            placeholderTextColor={theme.colors.textLight}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>내용</Text>
                        <TextInput
                            style={styles.contentInput}
                            placeholder="어떤 고민이 있으신가요? 자세히 적어주세요."
                            placeholderTextColor={theme.colors.textLight}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>해시태그 (최대 5개)</Text>
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                style={[
                                    styles.tagInput,
                                    tags.length >= 5 && styles.disabledInput
                                ]}
                                placeholder={tags.length >= 5 ? "해시태그는 5개까지만 입력 가능합니다" : "해시태그를 입력해주세요."}
                                placeholderTextColor={theme.colors.textLight}
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={handleAddTag}
                                editable={tags.length < 5}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.tagList}>
                            {tags.map((tag, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={styles.tagBadge}
                                    onPress={() => removeTag(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.tagText}>#{tag}</Text>
                                    <X size={14} color={theme.colors.primary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: theme.spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    completeButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
    },
    completeButtonText: {
        color: theme.colors.surface,
        fontWeight: 'bold',
        fontSize: 14,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: theme.spacing.lg,
    },
    inputSection: {
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    titleInput: {
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: theme.spacing.sm,
        color: theme.colors.text,
    },
    contentInput: {
        fontSize: 16,
        minHeight: 200,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: 14,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    disabledInput: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.border,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        gap: 4,
    },
    tagText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    removeTagButton: {
        padding: 2,
    },
});
