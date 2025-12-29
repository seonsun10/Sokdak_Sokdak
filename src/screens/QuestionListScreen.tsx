import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { ChevronLeft, MessageCircle, Flame } from 'lucide-react-native';
import { isToday, subDays, startOfDay, formatISO } from 'date-fns';
import { styles } from './styles/QuestionListScreen.styles';

const PAGE_SIZE = 10;

interface DBQuestion {
    id: string;
    title: string;
    author_name: string;
    created_at: string;
    commentCount: number;
}

export const QuestionListScreen = ({ route, navigation }: any) => {
    const { type, tab: initialTab } = route.params; // initialTab은 초기 진입 시 설정용, 이후 내부 state로 관리

    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>(initialTab || 'today');
    const [questions, setQuestions] = useState<DBQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const title = type === 'popular' ? '인기 질문' : '최신 질문';

    const fetchQuestions = async (pageNum: number) => {
        try {
            if (pageNum === 0) setLoading(true);
            else setLoadingMore(true);

            const from = pageNum * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('questions')
                .select('id, title, author_name, created_at, comments(count)');

            // 1. 유형별 필터링/정렬
            if (type === 'popular') {
                const now = new Date();
                let startDate;
                if (activeTab === 'today') startDate = startOfDay(now);
                else if (activeTab === 'week') startDate = subDays(startOfDay(now), 7);
                else startDate = subDays(startOfDay(now), 30);

                query = query.gte('created_at', formatISO(startDate));
                
                // 인기 질문은 클라이언트 사이드 정렬을 위해 조금 더 많이 가져옴 (간이 페이징)
                // 실제 고도화 시에는 RPC 또는 View를 사용하는 것이 좋지만 일단 메인과 동일 기조 유지
                const { data, error } = await query.limit(100); 
                if (error) throw error;

                const sorted = (data || [])
                    .map(q => ({
                        ...q,
                        commentCount: q.comments?.[0]?.count || 0
                    }))
                    .sort((a, b) => b.commentCount - a.commentCount);

                const sliced = sorted.slice(from, to + 1);
                setQuestions(prev => pageNum === 0 ? sliced : [...prev, ...sliced]);
                setHasMore(sorted.length > to + 1);

            } else {
                // 최신순 페이징
                query = query
                    .order('created_at', { ascending: false })
                    .range(from, to);

                const { data, error } = await query;
                if (error) throw error;

                if (data) {
                    const formatted = data.map(q => ({
                        ...q,
                        commentCount: q.comments?.[0]?.count || 0
                    }));
                    setQuestions(prev => pageNum === 0 ? formatted : [...prev, ...formatted]);
                    setHasMore(data.length === PAGE_SIZE);
                }
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchQuestions(0);
        setPage(0);
    }, [type, activeTab]);

    const handleLoadMore = () => {
        if (loading || loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchQuestions(nextPage);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isHot = type === 'popular' && index === 0 && questions.length > 0 && (item.commentCount || 0) > 0;

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
                    <Text style={styles.author}>{item.author_name}</Text>
                    <View style={styles.footerRight}>
                        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
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
                data={questions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>등록된 질문이 없어요.</Text>
                        <Text style={styles.emptySubText}>가장 먼저 질문을 올려보세요 🌸</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

