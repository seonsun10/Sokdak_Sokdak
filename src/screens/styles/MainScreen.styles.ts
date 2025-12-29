import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
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
        paddingVertical: theme.spacing.sm,
        paddingRight: theme.spacing.md,
        paddingLeft: 0,
        backgroundColor: theme.colors.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    headerLogo: {
        width: 100,
        height: 40,
        marginLeft: -10,
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
