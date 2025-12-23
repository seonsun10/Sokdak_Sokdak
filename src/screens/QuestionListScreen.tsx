import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { MOCK_QUESTIONS, Question } from '../data/mockData';
import { ChevronLeft, MessageCircle } from 'lucide-react-native';

export const QuestionListScreen = ({ route, navigation }: any) => {
    const { type, tab } = route.params;

    const title = type === 'popular' ? '인기 있는 질문' : '최신 질문';

    const questions = [...MOCK_QUESTIONS].sort((a, b) => {
        if (type === 'popular') return b.commentCount - a.commentCount;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const renderItem = ({ item }: { item: Question }) => (
        <TouchableOpacity style={styles.card}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.footer}>
                <Text style={styles.date}>{item.createdAt.toLocaleDateString()}</Text>
                <View style={styles.commentInfo}>
                    <MessageCircle size={14} color={theme.colors.textLight} />
                    <Text style={styles.commentCount}>{item.commentCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={questions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
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
    backButton: {
        padding: theme.spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
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
    },
    itemTitle: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
});
