// Question Detail Screen
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MOCK_QUESTIONS, MOCK_COMMENTS, Comment } from '../data/mockData';
import { ChevronLeft, MessageCircle, Heart, Trash2, ArrowUp, List, Send } from 'lucide-react-native';
import { format } from 'date-fns';
import { CustomModal } from '../components/CustomModal';

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

    // 커스텀 모달 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        onCancel: undefined as (() => void) | undefined,
        cancelText: '취소'
    });

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
            author: '본인사용자',
            content: inputText.trim(),
            likes: 0,
            isLiked: false,
            createdAt: new Date(),
            isMine: true,
        };

        const updatedAll = [newComment, ...allComments];
        const sorted = sortData(updatedAll, sortBy);
        setAllComments(sorted);
        setDisplayedComments(prev => [newComment, ...prev]);

        setInputText('');
        Keyboard.dismiss();
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    };



    const handleDeleteQuestion = () => {
        setModalConfig({
            title: '질문 삭제',
            message: '정말로 이 질문을 삭제하시겠습니까?',
            onConfirm: () => {
                setModalVisible(false);
                navigation.goBack();
            },
            onCancel: () => setModalVisible(false),
            cancelText: '취소'
        });
        setModalVisible(true);
    };

    const renderHeader = () => {
        if (!question) return null;
        return (
            <View>
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
                    {question.author === '본인사용자' && (
                        <TouchableOpacity onPress={handleDeleteQuestion} style={[styles.headerActionBtn, styles.deleteBtn]}>
                            <Trash2 size={14} color={theme.colors.error} />
                            <Text style={styles.headerActionText}>삭제</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <CustomModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                cancelText={modalConfig.cancelText}
            />

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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    deleteBtn: {
        backgroundColor: '#FFF0F0', // 아주 연한 빨강
    },
    headerActionText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.colors.error,
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
        bottom: 120,
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
        paddingVertical: 8,
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
