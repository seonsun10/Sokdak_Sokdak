import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MOCK_QUESTIONS, Question } from '../data/mockData';
import { ChevronLeft, MessageCircle, Flame } from 'lucide-react-native';
import { isToday, subDays, startOfDay } from 'date-fns';

export const QuestionListScreen = ({ route, navigation }: any) => {
    const { type, tab: initialTab } = route.params; // initialTab은 초기 진입 시 설정용, 이후 내부 state로 관리

    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>(initialTab || 'today');
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    const title = type === 'popular' ? '인기 질문' : '최신 질문';

    useEffect(() => {
        // 필터링 및 정렬 로직
        const filtered = MOCK_QUESTIONS.filter(q => {
            if (type === 'popular') {
                const now = new Date();
                if (activeTab === 'today') return isToday(q.createdAt);
                if (activeTab === 'week') return q.createdAt >= subDays(startOfDay(now), 7);
                if (activeTab === 'month') return q.createdAt >= subDays(startOfDay(now), 30);
            }
            return true;
        }).sort((a, b) => {
            if (type === 'popular') return b.commentCount - a.commentCount;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        setAllQuestions(filtered);
        setDisplayedQuestions(filtered.slice(0, 10));
        setPage(1);
    }, [type, activeTab]);

    const handleLoadMore = () => {
        if (loadingMore || displayedQuestions.length >= allQuestions.length) return;

        setLoadingMore(true);
        setTimeout(() => {
            const nextBatch = allQuestions.slice(page * 10, (page + 1) * 10);
            if (nextBatch.length > 0) {
                setDisplayedQuestions(prev => [...prev, ...nextBatch]);
                setPage(p => p + 1);
            }
            setLoadingMore(false);
        }, 500);
    };

    const renderItem = ({ item, index }: { item: Question, index: number }) => {
        // 인기 질문이면서 첫 번째 항목인 경우 Hot 배지 표시 (단, 필터링 된 목록 내에서)
        const isHot = type === 'popular' && index === 0 && displayedQuestions.length > 0;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    {isHot && (
                        <View style={styles.hotBadge}>
                            <Flame size={12} color={theme.colors.surface} />
                            <Text style={styles.hotBadgeText}>Hot</Text>
                        </View>
                    )}
                </View>
                <View style={styles.footer}>
                    <Text style={styles.author}>{item.author}</Text>
                    <View style={styles.footerRight}>
                        <Text style={styles.date}>{item.createdAt.toLocaleDateString()}</Text>
                        <View style={styles.commentInfo}>
                            <MessageCircle size={14} color={theme.colors.textLight} />
                            <Text style={styles.commentCount}>{item.commentCount}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>

                {type === 'popular' && (
                    <View style={styles.tabContainer}>
                        {(['today', 'week', 'month'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab ? styles.activeTab : {}]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : {}]}>
                                    {tab === 'today' ? '오늘' : tab === 'week' ? '이번주' : '이번달'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <FlatList
                data={displayedQuestions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>해당 기간에 등록된 질문이 없어요. 🌸</Text>
                    </View>
                }
            />
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: theme.spacing.xs,
        marginRight: theme.spacing.sm,
    },
    headerTitle: {
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
        paddingHorizontal: 8,
        borderRadius: theme.borderRadius.full,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 11,
        color: theme.colors.primary,
    },
    activeTabText: {
        color: theme.colors.surface,
        fontWeight: 'bold',
    },
    list: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    itemTitle: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    author: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    date: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    commentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentCount: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    footerLoader: {
        paddingVertical: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textLight,
        fontSize: 14,
    },
});
