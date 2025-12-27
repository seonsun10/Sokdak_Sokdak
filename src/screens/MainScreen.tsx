import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, ChevronRight, Flame, PenLine, LogOut } from 'lucide-react-native';
import { isToday, subDays, startOfDay, formatISO } from 'date-fns';
import { RefreshControl } from 'react-native';

interface DBQuestion {
    id: string;
    title: string;
    author_name: string;
    created_at: string;
    comments?: { count: number }[];
    commentCount?: number; // 클라이언트 측에서 계산된 댓글 수
}

export const MainScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
    const [popularQuestions, setPopularQuestions] = useState<DBQuestion[]>([]);
    const [recentQuestions, setRecentQuestions] = useState<DBQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error: any) {
            console.error('Logout error:', error.message);
        }
    };

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const now = new Date();
            let startDate;
            if (activeTab === 'today') startDate = startOfDay(now);
            else if (activeTab === 'week') startDate = subDays(startOfDay(now), 7);
            else startDate = subDays(startOfDay(now), 30);

            // 1. 인기 질문 페칭 (댓글 수 포함)
            const { data: popularData, error: popularError } = await supabase
                .from('questions')
                .select('id, title, author_name, created_at, comments(count)')
                .gte('created_at', formatISO(startDate))
                .limit(50); // 정렬을 위해 일단 넉넉히 가져옴

            if (popularError) throw popularError;

            // 서브쿼리 개수 기준으로 클라이언트 측 정렬 및 상위 5개 추출
            const sortedPopular = (popularData || [])
                .map(q => ({
                    ...q,
                    commentCount: q.comments?.[0]?.count || 0
                }))
                .sort((a, b) => b.commentCount - a.commentCount)
                .slice(0, 5);
            
            setPopularQuestions(sortedPopular as any);

            // 2. 최신 질문 페칭
            const { data: recentData, error: recentError } = await supabase
                .from('questions')
                .select('id, title, author_name, created_at, comments(count)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            const formattedRecent = (recentData || []).map(q => ({
                ...q,
                commentCount: q.comments?.[0]?.count || 0
            }));

            setRecentQuestions(formattedRecent as any);

        } catch (error) {
            console.error('MainScreen data fetching error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const onRefresh = () => {
        fetchData(true);
    };

    const hotQuestionId = (popularQuestions.length > 0 && (popularQuestions[0].commentCount || 0) > 0) 
        ? popularQuestions[0].id 
        : null;

    const renderQuestionItem = (item: any, isHot: boolean = false) => (
        <TouchableOpacity
            key={item.id}
            style={styles.questionCard}
            onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
        >
            <View style={styles.questionHeader}>
                <Text style={styles.questionTitle} numberOfLines={1}>{item.title}</Text>
                {isHot ? (
                    <View style={styles.hotBadge}>
                        <Flame size={12} color={theme.colors.surface} />
                        <Text style={styles.hotBadgeText}>Hot</Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.questionFooter}>
                <Text style={styles.authorText}>{item.author_name}</Text>
                <View style={styles.commentInfo}>
                    <MessageCircle size={14} color={theme.colors.textLight} />
                    <Text style={styles.commentCountText}>{item.commentCount || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>속닥속닥</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                        <LogOut size={22} color={theme.colors.textLight} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Heart size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView 
                style={styles.container} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >

                {/* 첫 번째 섹션: 인기 질문 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>가장 인기 있는 질문!</Text>
                        <View style={styles.tabContainer}>
                            {(['today', 'week', 'month'] as const).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab ? styles.activeTab : {}]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <View>
                                        <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : {}]}>
                                            {tab === 'today' ? '오늘' : tab === 'week' ? '이번주' : '이번달'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.listContainer}>
                        {popularQuestions.length > 0 ? (
                            popularQuestions.map((q) => renderQuestionItem(q, q.id === hotQuestionId))
                        ) : (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>등록된 질문이 없어요.</Text>
                                <Text style={styles.emptySubText}>가장 먼저 질문을 올려보세요 🌸</Text>
                            </View>
                        )}
                    </View>

                    {popularQuestions.length > 0 && (
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => navigation.navigate('QuestionList', { type: 'popular', tab: activeTab })}
                        >
                            <Text style={styles.moreButtonText}>더보기</Text>
                            <ChevronRight size={16} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.divider} />

                {/* 두 번째 섹션: 최신 질문 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>최신 올라온 질문</Text>
                    </View>

                    <View style={styles.listContainer}>
                        {recentQuestions.length > 0 ? (
                            recentQuestions.map((q) => renderQuestionItem(q))
                        ) : (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>등록된 질문이 없어요.</Text>
                                <Text style={styles.emptySubText}>가장 먼저 질문을 올려보세요 🌸</Text>
                            </View>
                        )}
                    </View>

                    {recentQuestions.length > 0 && (
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => navigation.navigate('QuestionList', { type: 'recent' })}
                        >
                            <Text style={styles.moreButtonText}>더보기</Text>
                            <ChevronRight size={16} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* 글쓰기 플로팅 버튼 */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('WriteQuestion')}
                >
                    <PenLine size={24} color={theme.colors.surface} />
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        padding: 8,
    },
    profileButton: {
        padding: 8,
    },
    section: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primaryLight,
        borderRadius: theme.borderRadius.full,
        padding: 2,
    },
    tab: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.full,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 12,
        color: theme.colors.primary,
    },
    activeTabText: {
        color: theme.colors.surface,
        fontWeight: 'bold',
    },
    listContainer: {
        gap: theme.spacing.sm,
    },
    questionCard: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    questionTitle: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    hotBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.hot,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        gap: 2,
    },
    hotBadgeText: {
        color: theme.colors.surface,
        fontSize: 10,
        fontWeight: 'bold',
    },
    questionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorText: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    commentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentCountText: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    moreButtonText: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginRight: 4,
    },
    divider: {
        height: 12,
        backgroundColor: theme.colors.background,
    },
    emptyCard: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyText: {
        fontSize: 15,
        color: theme.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 12,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
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
});
