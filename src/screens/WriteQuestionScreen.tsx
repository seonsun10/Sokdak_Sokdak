import React, { useState, useRef } from 'react';
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
import { ChevronLeft, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_QUESTIONS, Question } from '../data/mockData';

export const WriteQuestionScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    // 유효성 검사 에러 상태
    const [errors, setErrors] = useState({ title: false, content: false });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            Alert.alert('알림', '태그는 최대 5개까지만 추가할 수 있습니다.');
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

    const handleComplete = async () => {
        // 기존 에러 및 메시지 초기화
        setErrors({ title: false, content: false });
        setErrorMessage(null);

        let hasError = false;
        const newErrors = { title: false, content: false };

        // 내용부터 검사 (제목이 비었을 때 제목으로 포커스가 가야하므로 역순 혹은 로직 순서 중요)
        // 여기서는 위에서부터 검사하여 첫 번째 비어있는 곳에 포커스
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
            // 첫 번째 에러 요소에 포커스
            if (newErrors.title) {
                titleRef.current?.focus();
            } else if (newErrors.content) {
                contentRef.current?.focus();
            }
            return;
        }

        // 등록 로직 시뮬레이션
        try {
            // 실패 시뮬레이션 (예: 특정 키워드가 있으면 실패)
            if (title.includes('error')) {
                throw new Error('등록에 실패했습니다.');
            }

            const newQuestion: Question = {
                id: `new-${Date.now()}`,
                title: title.trim(),
                content: content.trim(),
                author: '본인사용자', // 임시 사용자
                commentCount: 0,
                createdAt: new Date(),
                tags: tags
            };

            // 데이터 추가 (메모리 상)
            MOCK_QUESTIONS.unshift(newQuestion);

            // 성공 시 Alert 없이 바로 상세 화면으로 이동 (Replace로 스택 교체 추천)
            navigation.replace('QuestionDetail', { questionId: newQuestion.id });

        } catch (e) {
            setErrorMessage('게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
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

            {/* 에러 메시지 표시 영역 */}
            {errorMessage && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

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
                                errors.title && styles.inputError // 에러 시 스타일 적용
                            ]}
                            placeholder="제목을 입력하세요"
                            placeholderTextColor={theme.colors.textLight}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (text.trim()) setErrors(prev => ({ ...prev, title: false })); // 입력 시 에러 해제
                            }}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={[styles.label, errors.content && styles.errorLabel]}>내용</Text>
                        <TextInput
                            ref={contentRef}
                            style={[
                                styles.contentInput,
                                errors.content && styles.inputError // 에러 시 스타일 적용
                            ]}
                            placeholder="어떤 고민이 있으신가요? 자세히 적어주세요."
                            placeholderTextColor={theme.colors.textLight}
                            value={content}
                            onChangeText={(text) => {
                                setContent(text);
                                if (text.trim()) setErrors(prev => ({ ...prev, content: false })); // 입력 시 에러 해제
                            }}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>태그 (최대 5개)</Text>
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                style={[
                                    styles.tagInput,
                                    tags.length >= 5 && styles.disabledInput
                                ]}
                                placeholder={tags.length >= 5 ? "태그는 5개까지만 입력 가능합니다" : "태그를 입력해주세요."}
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
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: theme.spacing.sm,
        alignItems: 'center',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: 'bold',
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
        color: theme.colors.primary, // 에러 시 라벨도 브랜드 컬러로 강조
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
    inputError: {
        borderColor: theme.colors.primary,
        borderBottomColor: theme.colors.primary,
        borderWidth: 2, // 더 진하게
        borderBottomWidth: 2,
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
