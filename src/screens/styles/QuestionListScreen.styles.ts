import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
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
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 13,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: 6,
    },
});
