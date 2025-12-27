// Question Detail Screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { ChevronLeft, MessageCircle, Heart, Trash2, ArrowUp, List, Send, Pencil, Edit2, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { CustomModal } from '../components/CustomModal';
import { useUserStore } from '../store/useUserStore';

interface DBComment {
    id: string;
    question_id: string;
    author_id: string;
    author_name: string;
    content: string;
    likes: number;
    created_at: string;
    isLiked?: boolean; // 클라이언트 측 상태
}

interface DBQuestion {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author_name: string;
    tags: string[];
    created_at: string;
}

export const QuestionDetailScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { questionId } = route.params;
    const { session } = useUserStore();
    
    const [question, setQuestion] = useState<DBQuestion | null>(null);
    const [comments, setComments] = useState<DBComment[]>([]);
    const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [inputText, setInputText] = useState('');

    // 댓글 수정 관련 상태
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

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

    const PAGE_SIZE = 10;

    const fetchQuestionDetail = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('id', questionId)
                .single();

            if (error) throw error;
            setQuestion(data);
        } catch (error) {
            console.error('Error fetching question detail:', error);
            Alert.alert('오류', '질문을 불러오는 중 문제가 발생했습니다.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (pageNum: number) => {
        try {
            if (pageNum === 0) setLoading(false); // 질문 상세 로딩이 있으므로 댓글 첫 로딩은 별도 표시 안 함
            else setLoadingMore(true);

            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('comments')
                .select('*')
                .eq('question_id', questionId);

            if (sortBy === 'popular') {
                query = query.order('likes', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query.range(from, to);
            if (error) throw error;

            if (data) {
                setComments(prev => pageNum === 0 ? data : [...prev, ...data]);
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchQuestionDetail();
            fetchComments(0);
        }, [questionId, sortBy])
    );

    const handleLike = async (commentId: string) => {
        // [참고] 실무에선 '좋아요' 전용 테이블을 두어 유저 중복을 방지하지만, 
        // 여기서는 간단히 숫자를 올리는 로직으로 구현합니다.
        try {
            const comment = comments.find(c => c.id === commentId);
            if (!comment) return;

            const { error } = await supabase
                .from('comments')
                .update({ likes: (comment.likes || 0) + 1 })
                .eq('id', commentId);

            if (error) throw error;

            setComments(prev => prev.map(c => 
                c.id === commentId ? { ...c, likes: (c.likes || 0) + 1, isLiked: true } : c
            ));
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleDelete = (commentId: string) => {
        setModalConfig({
            title: '댓글 삭제',
            message: '정말로 이 댓글을 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('comments')
                        .delete()
                        .eq('id', commentId);

                    if (error) throw error;
                    setComments(prev => prev.filter(c => c.id !== commentId));
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    Alert.alert('오류', '댓글 삭제에 실패했습니다.');
                } finally {
                    setModalVisible(false);
                }
            },
            onCancel: () => setModalVisible(false),
            cancelText: '취소'
        });
        setModalVisible(true);
    };

    const handleStartEditComment = (comment: DBComment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.content);
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editCommentText.trim()) return;

        try {
            const { error } = await supabase
                .from('comments')
                .update({ content: editCommentText.trim() })
                .eq('id', commentId);

            if (error) throw error;

            setComments(prev => prev.map(c => 
                c.id === commentId ? { ...c, content: editCommentText.trim() } : c
            ));
            handleCancelEditComment();
        } catch (error) {
            console.error('Error updating comment:', error);
            Alert.alert('오류', '댓글 수정에 실패했습니다.');
        }
    };

    const handleLoadMore = () => {
        if (loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage);
    };

    const handleSend = async () => {
        if (!inputText.trim() || !session?.user) return;

        try {
            const { profile } = useUserStore.getState();
            const authorName = profile?.nickname || '새로운 유저';

            const { data, error } = await supabase
                .from('comments')
                .insert({
                    question_id: questionId,
                    author_id: session.user.id,
                    author_name: authorName,
                    content: inputText.trim()
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setComments(prev => [data, ...prev]);
                setInputText('');
                Keyboard.dismiss();
                setTimeout(() => {
                    listRef.current?.scrollToOffset({ offset: 0, animated: true });
                }, 100);
            }
        } catch (error) {
            console.error('Error sending comment:', error);
            Alert.alert('오류', '댓글 작성에 실패했습니다.');
        }
    };

    const handleDeleteQuestion = () => {
        setModalConfig({
            title: '질문 삭제',
            message: '정말로 이 질문을 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('questions')
                        .delete()
                        .eq('id', questionId);

                    if (error) throw error;
                    setModalVisible(false);
                    navigation.goBack();
                } catch (error) {
                    console.error('Error deleting question:', error);
                    Alert.alert('오류', '질문 삭제에 실패했습니다.');
                    setModalVisible(false);
                }
            },
            onCancel: () => setModalVisible(false),
            cancelText: '취소'
        });
        setModalVisible(true);
    };

    const handleEditQuestion = () => {
        if (!question) return;
        navigation.navigate('WriteQuestion', { 
            isEdit: true,
            questionId: question.id,
            initialTitle: question.title,
            initialContent: question.content,
            initialTags: question.tags || []
        });
    };

    const renderHeader = () => {
        if (!question) return null;
        return (
            <View>
                <View style={styles.questionSection}>
                    <Text style={styles.title}>{question.title}</Text>
                    <View style={styles.authorRow}>
                        <Text style={styles.author}>{question.author_name}</Text>
                        <Text style={styles.date}>{format(new Date(question.created_at), 'yyyy.MM.dd HH:mm')}</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.content}>{question.content}</Text>
                    {question.tags && question.tags.length > 0 && (
                        <View style={styles.tagContainer}>
                            {question.tags.map(tag => (
                                <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.commentHeader}>
                    <Text style={styles.commentCount}>댓글 {comments.length}</Text>
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

    const renderComment = ({ item }: { item: DBComment }) => {
        const isMine = item.author_id === session?.user?.id;
        const isEditing = editingCommentId === item.id;
        
        return (
            <View style={styles.commentItem}>
                <View style={styles.commentTop}>
                    <Text style={styles.commentAuthor}>{item.author_name}</Text>
                    <View style={styles.commentActions}>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.likeButton}>
                                <Heart
                                    size={18}
                                    color={item.isLiked ? theme.colors.hot : theme.colors.textLight}
                                    fill={item.isLiked ? theme.colors.hot : 'transparent'}
                                />
                                <Text style={[styles.likeCount, item.isLiked ? { color: theme.colors.hot } : {}]}>
                                    {item.likes || 0}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {isMine && !isEditing ? (
                            <>
                                <TouchableOpacity onPress={() => handleStartEditComment(item)} style={styles.actionIconButton}>
                                    <Edit2 size={16} color={theme.colors.textLight} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                                    <Trash2 size={18} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            </>
                        ) : isMine && isEditing ? (
                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={handleCancelEditComment} style={styles.actionIconButton}>
                                    <X size={18} color={theme.colors.textLight} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUpdateComment(item.id)} style={styles.actionIconButton}>
                                    <Send size={18} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
                
                {isEditing ? (
                    <TextInput
                        style={styles.editInput}
                        value={editCommentText}
                        onChangeText={setEditCommentText}
                        multiline
                        autoFocus
                        maxLength={200}
                    />
                ) : (
                    <Text style={styles.commentContent}>{item.content}</Text>
                )}
                
                <Text style={styles.commentDate}>{format(new Date(item.created_at), 'yyyy.MM.dd HH:mm')}</Text>
            </View>
        );
    };

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
                    {question?.author_id === session?.user?.id && (
                        <>
                            <TouchableOpacity onPress={handleEditQuestion} style={[styles.headerActionBtn, styles.editBtn]}>
                                <Pencil size={14} color={theme.colors.primary} />
                                <Text style={styles.headerActionTextEdit}>수정</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteQuestion} style={[styles.headerActionBtn, styles.deleteBtn]}>
                                <Trash2 size={14} color={theme.colors.error} />
                                <Text style={styles.headerActionText}>삭제</Text>
                            </TouchableOpacity>
                        </>
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
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
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
    editBtn: {
        backgroundColor: theme.colors.primaryLight,
    },
    headerActionTextEdit: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.colors.primary,
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
    actionIconButton: {
        padding: 4,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editInput: {
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 8,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: theme.colors.primary,
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
