import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MOCK_QUESTIONS, Question } from '../data/mockData';
import { Heart, MessageCircle, ChevronRight, Flame } from 'lucide-react-native';

export const MainScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

    // 첫 번째 섹션 (인기 질문) - 댓글 수 기준 정렬
    const popularQuestions = [...MOCK_QUESTIONS]
        .sort((a, b) => b.commentCount - a.commentCount)
        .slice(0, 5);

    // 두 번째 섹션 (최신 질문) - 날짜 기준 정렬
    const recentQuestions = [...MOCK_QUESTIONS]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

    const renderQuestionItem = (item: Question, isHot: boolean = false) => (
        <TouchableOpacity
            key={item.id}
            style={styles.questionCard}
            onPress={() => { }}
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
                <Text style={styles.authorText}>{item.author}</Text>
                <View style={styles.commentInfo}>
                    <MessageCircle size={14} color={theme.colors.textLight} />
                    <Text style={styles.commentCountText}>{item.commentCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>CoupleQ</Text>
                    <TouchableOpacity style={styles.profileButton}>
                        <Heart size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

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
                        {popularQuestions.map((q, index) => renderQuestionItem(q, index === 0))}
                    </View>

                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => navigation.navigate('QuestionList', { type: 'popular', tab: activeTab })}
                    >
                        <Text style={styles.moreButtonText}>더보기</Text>
                        <ChevronRight size={16} color={theme.colors.textLight} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* 두 번째 섹션: 최신 질문 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>최신 올라온 질문</Text>
                    </View>

                    <View style={styles.listContainer}>
                        {recentQuestions.map((q) => renderQuestionItem(q))}
                    </View>

                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => navigation.navigate('QuestionList', { type: 'recent' })}
                    >
                        <Text style={styles.moreButtonText}>더보기</Text>
                        <ChevronRight size={16} color={theme.colors.textLight} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    profileButton: {
        padding: theme.spacing.sm,
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
});
