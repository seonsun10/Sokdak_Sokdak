import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { ChevronLeft, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_QUESTIONS, Question } from '../data/mockData';
import { CustomModal } from '../components/CustomModal';

export const WriteQuestionScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    // 유효성 검사 에러 상태
    const [errors, setErrors] = useState({ title: false, content: false });
    const [focusedField, setFocusedField] = useState<'title' | 'content' | 'tag' | null>(null);

    // 커스텀 모달 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // 포커스 제어를 위한 Ref
    const titleRef = useRef<TextInput>(null);
    const contentRef = useRef<TextInput>(null);

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().replace(/^#/, '');
        if (!trimmedTag) {
            setTagInput('');
            return;
        }

        if (tags.length >= 5) {
            setModalConfig({
                title: '알림',
                message: '태그는 최대 5개까지만 추가할 수 있습니다.',
                onConfirm: () => setModalVisible(false)
            });
            setModalVisible(true);
            return;
        }

        if (tags.includes(trimmedTag)) {
            setModalConfig({
                title: '알림',
                message: '이미 추가된 태그입니다.',
                onConfirm: () => setModalVisible(false)
            });
            setModalVisible(true);
            setTagInput('');
            return;
        }

        setTags([...tags, trimmedTag]);
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleComplete = async () => {
        // 기존 에러 초기화
        setErrors({ title: false, content: false });

        let hasError = false;
        const newErrors = { title: false, content: false };

        if (!title.trim()) {
            newErrors.title = true;
            hasError = true;
        }
        if (!content.trim()) {
            newErrors.content = true;
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            if (newErrors.title) {
                titleRef.current?.focus();
            } else if (newErrors.content) {
                contentRef.current?.focus();
            }
            return;
        }

        try {
            // 등록 로직
            const newQuestion: Question = {
                id: `new-${Date.now()}`,
                title: title.trim(),
                content: content.trim(),
                author: '본인사용자', // 임시 사용자
                commentCount: 0,
                createdAt: new Date(),
                tags: tags
            };

            MOCK_QUESTIONS.unshift(newQuestion);
            
            setModalConfig({
                title: '등록 완료',
                message: '새로운 질문이 등록되었습니다.',
                onConfirm: () => {
                    setModalVisible(false);
                    navigation.replace('QuestionDetail', { questionId: newQuestion.id });
                }
            });
            setModalVisible(true);
        } catch (e) {
            setModalConfig({
                title: '오류',
                message: '게시글 등록에 실패했습니다.',
                onConfirm: () => setModalVisible(false)
            });
            setModalVisible(true);
        }
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

            <CustomModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 + insets.top : 20}
            >
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.inputSection}>
                        <Text style={[styles.label, errors.title && styles.errorLabel]}>제목</Text>
                        <TextInput
                            ref={titleRef}
                            style={[
                                styles.titleInput,
                                errors.title && styles.inputError,
                                focusedField === 'title' && !errors.title && styles.inputFocused
                            ]}
                            placeholder="제목을 입력하세요"
                            placeholderTextColor={theme.colors.textLight}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (errors.title) setErrors(prev => ({ ...prev, title: false }));
                            }}
                            onFocus={() => setFocusedField('title')}
                            onBlur={() => setFocusedField(null)}
                            maxLength={50}
                            underlineColorAndroid="transparent"
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={[styles.label, errors.content && styles.errorLabel]}>내용</Text>
                        <View style={styles.contentInputContainer}>
                            <TextInput
                                ref={contentRef}
                                style={[
                                    styles.contentInput,
                                    errors.content && styles.inputError,
                                    focusedField === 'content' && !errors.content && styles.inputFocused
                                ]}
                                placeholder="어떤 고민이 있으신가요? 자세히 적어주세요."
                                placeholderTextColor={theme.colors.textLight}
                                value={content}
                                onChangeText={(text) => {
                                    setContent(text);
                                    if (errors.content) setErrors(prev => ({ ...prev, content: false }));
                                }}
                                onFocus={() => setFocusedField('content')}
                                onBlur={() => setFocusedField(null)}
                                multiline
                                textAlignVertical="top"
                                underlineColorAndroid="transparent"
                                maxLength={2000}
                            />
                            <Text style={[
                                styles.charCount,
                                content.length >= 2000 && styles.charCountMax
                            ]}>
                                {content.length}/2000
                            </Text>
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>태그 (최대 5개)</Text>
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                style={[
                                    styles.tagInput,
                                    tags.length >= 5 && styles.disabledInput,
                                    focusedField === 'tag' && styles.inputFocused
                                ]}
                                placeholder={tags.length >= 5 ? "해시태그는 5개까지만 입력 가능합니다" : "해시태그를 입력해주세요."}
                                placeholderTextColor={theme.colors.textLight}
                                value={tagInput}
                                onChangeText={setTagInput}
                                onFocus={() => setFocusedField('tag')}
                                onBlur={() => setFocusedField(null)}
                                onSubmitEditing={handleAddTag}
                                editable={tags.length < 5}
                                autoCapitalize="none"
                                underlineColorAndroid="transparent"
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
    errorLabel: {
        color: theme.colors.primary,
    },
    titleInput: {
        fontSize: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    contentInputContainer: {
        position: 'relative',
    },
    contentInput: {
        fontSize: 16,
        minHeight: 200,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        paddingBottom: 40,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    charCount: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        fontSize: 12,
        color: theme.colors.textLight,
    },
    charCountMax: {
        color: theme.colors.hot,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: theme.colors.hot,
        borderWidth: 1.5,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
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
});
