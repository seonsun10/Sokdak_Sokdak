// Question Detail Screen
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MOCK_QUESTIONS, MOCK_COMMENTS, Comment } from '../data/mockData';
import { ChevronLeft, MessageCircle, Heart, Trash2, ArrowUp, List, Send } from 'lucide-react-native';
import { format } from 'date-fns';

export const QuestionDetailScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { questionId } = route.params;
    const question = MOCK_QUESTIONS.find(q => q.id === questionId);

    const [allComments, setAllComments] = useState<Comment[]>([]);
    const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
    const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [inputText, setInputText] = useState('');

    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        const filtered = MOCK_COMMENTS.filter(c => c.questionId === questionId);
        const sorted = sortData(filtered, sortBy);
        setAllComments(sorted);
        setDisplayedComments(sorted.slice(0, 10));
        setPage(1);
    }, [questionId, sortBy]);

    const sortData = (data: Comment[], criterion: 'popular' | 'recent') => {
        return [...data].sort((a, b) => {
            if (criterion === 'popular') return b.likes - a.likes;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    };

    const handleLike = (commentId: string) => {
        const updateFunc = (prev: Comment[]) => prev.map(c => {
            if (c.id === commentId) {
                const newIsLiked = !c.isLiked;
                return {
                    ...c,
                    isLiked: newIsLiked,
                    likes: newIsLiked ? c.likes + 1 : c.likes - 1
                };
            }
            return c;
        });
        setDisplayedComments(updateFunc);
        setAllComments(updateFunc);
    };

    const handleDelete = (commentId: string) => {
        const updateFunc = (prev: Comment[]) => prev.filter(c => c.id !== commentId);
        setDisplayedComments(updateFunc);
        setAllComments(updateFunc);
    };

    const handleLoadMore = () => {
        if (loadingMore || displayedComments.length >= allComments.length) return;

        setLoadingMore(true);
        // 즉각적인 반응을 위해 지연시간을 대폭 줄임
        setTimeout(() => {
            const nextBatch = allComments.slice(page * 10, (page + 1) * 10);
            if (nextBatch.length > 0) {
                setDisplayedComments(prev => [...prev, ...nextBatch]);
                setPage(p => p + 1);
            }
            setLoadingMore(false);
        }, 300);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newComment: Comment = {
            id: `new-${Date.now()}`,
            questionId,
            author: '본인사용자', // 로그인 연동 전 임시 ID
            content: inputText.trim(),
            likes: 0,
            isLiked: false,
            createdAt: new Date(),
            isMine: true,
        };

        const updatedAll = [newComment, ...allComments];
        setAllComments(updatedAll);

        // 정렬 기준에 따라 리스트 갱신
        const sorted = sortData(updatedAll, sortBy);
        setAllComments(sorted);

        // 화면에 즉시 반영 (맨 앞에 추가하거나 정렬 다시 해서 반영)
        // 여기서는 간단히 displayedComments 맨 앞에 추가하여 즉시 피드백 제공
        setDisplayedComments(prev => [newComment, ...prev]);

        setInputText('');
        Keyboard.dismiss();

        // 스크롤 최상단 이동
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const handleEditQuestion = () => {
        Alert.alert('알림', '질문 수정 화면으로 이동합니다.');
    };

    const handleDeleteQuestion = () => {
        Alert.alert(
            '질문 삭제',
            '정말로 이 질문을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => navigation.goBack() }
            ]
        );
    };

    const renderHeader = () => {
        if (!question) return null;
        return (
            <View>
                {/* 질문 본문 */}
                <View style={styles.questionSection}>
                    <Text style={styles.title}>{question.title}</Text>
                    <View style={styles.authorRow}>
                        <Text style={styles.author}>{question.author}</Text>
                        <Text style={styles.date}>{format(question.createdAt, 'yyyy.MM.dd HH:mm:ss')}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.content}>{question.content}</Text>
                    <View style={styles.tagContainer}>
                        {question.tags.map(tag => (
                            <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
                        ))}
                    </View>
                </View>

                {/* 댓글 섹션 헤더 */}
                <View style={styles.commentHeader}>
                    <Text style={styles.commentCount}>댓글 {allComments.length}</Text>
                    <View style={styles.sortContainer}>
                        <TouchableOpacity onPress={() => setSortBy('popular')}>
                            <Text style={[styles.sortText, sortBy === 'popular' ? styles.activeSortText : {}]}>인기순</Text>
                        </TouchableOpacity>
                        <Text style={styles.sortDivider}>|</Text>
                        <TouchableOpacity onPress={() => setSortBy('recent')}>
                            <Text style={[styles.sortText, sortBy === 'recent' ? styles.activeSortText : {}]}>최신순</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentTop}>
                <Text style={styles.commentAuthor}>{item.author}</Text>
                <View style={styles.commentActions}>
                    <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.likeButton}>
                        <Heart
                            size={18}
                            color={item.isLiked ? theme.colors.hot : theme.colors.textLight}
                            fill={item.isLiked ? theme.colors.hot : 'transparent'}
                        />
                        <Text style={[styles.likeCount, item.isLiked ? { color: theme.colors.hot } : {}]}>
                            {item.likes}
                        </Text>
                    </TouchableOpacity>
                    {item.isMine ? (
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                            <Trash2 size={18} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentDate}>{format(item.createdAt, 'yyyy.MM.dd HH:mm:ss')}</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MessageCircle size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>아직 등록된 댓글이 없어요.</Text>
            <Text style={styles.emptySubText}>첫 번째 의견을 남겨보세요! 🌸</Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 100 }} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.loadingMoreText}>불러오는 중...</Text>
            </View>
        );
    };

    if (!question) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleEditQuestion} style={styles.headerActionBtn}>
                        <Text style={styles.headerActionText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteQuestion} style={styles.headerActionBtn}>
                        <Text style={[styles.headerActionText, { color: theme.colors.error }]}>삭제</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 + insets.top : 0}
            >
                <FlatList
                    ref={listRef}
                    data={displayedComments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    removeClippedSubviews={true}
                />

                {/* 댓글 입력창 */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="따뜻한 댓글을 남겨주세요..."
                        placeholderTextColor={theme.colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={200}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send size={16} color={theme.colors.surface} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* 플로팅 버튼 */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
                >
                    <ArrowUp size={24} color={theme.colors.surface} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Main')}
                >
                    <List size={24} color={theme.colors.surface} />
                </TouchableOpacity>
            </View>
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerActionBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    headerActionText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textLight,
    },
    listContent: {
        backgroundColor: theme.colors.background,
    },
    questionSection: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.sm,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    authorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    author: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    tag: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    tagText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    commentCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        fontSize: 13,
        color: theme.colors.textLight,
    },
    activeSortText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    sortDivider: {
        marginHorizontal: 8,
        color: theme.colors.border,
    },
    commentItem: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        marginHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    commentTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    likeCount: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    deleteButton: {
        padding: 2,
    },
    commentContent: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: theme.spacing.xs,
    },
    commentDate: {
        fontSize: 10,
        color: theme.colors.textLight,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '600',
        marginTop: theme.spacing.sm,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginTop: 4,
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 14,
        color: theme.colors.textLight,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 160, // 입력창 위로 충분히 올림
        right: 20,
        gap: 12,
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.md,
    },
    textInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8, // 높이 고정보다는 패딩으로 조절
        maxHeight: 100,
        fontSize: 14,
        color: theme.colors.text,
        marginRight: theme.spacing.sm,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.border,
    },
});
