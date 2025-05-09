import { StyleSheet, Dimensions } from 'react-native';
import { getThemeColors } from 'src/theme/colors';

export const createStyles = (isDarkMode: boolean) => {
  const colors = getThemeColors(isDarkMode);

  return StyleSheet.create({
    // Main containers
    container: {
      width: '100%',
      paddingVertical: 10,
      height: Dimensions.get('window').height * 0.7,
      backgroundColor: colors.background.primary,
    },
    listContainer: {
      flex: 1,
    },

    // Comment layout
    commentContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      width: '100%',
    },
    replyContainer: {
      marginLeft: 30,
      width: '91%',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 8,
      marginRight: 8,
    },
    commentContent: {
      flex: 1,
      paddingRight: 35,
    },
    // Reply visuals
    replyLineContainer: {
      position: 'absolute',
      left: -25,
      height: 40,
      alignItems: 'center',
      borderColor: colors.border.light,
    },
    replyCurve: {
      position: 'absolute',
      bottom: 15,
      right: -11,
      width: 12,
      height: "100%",
      borderBottomLeftRadius: 12,
      borderWidth: 1,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderColor: colors.border.light,
    },

    // Comment text styles
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    username: {
      fontFamily: "Chirp_Bold",
      fontSize: 14,
      color: colors.text.primary,
    },
    time: {
      fontSize: 12,
      marginLeft: 6,
      color: colors.text.tertiary,
      fontFamily: "Chirp_Regular",
    },
    commentText: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 4,
      color: colors.text.primary,
      fontFamily: "Chirp_Regular",
    },

    actionsContainer: {
      position: 'absolute',
      right: 1,
      top: 6,
      justifyContent: 'center',
      zIndex: 999999
    },
    actionButton: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    },
    replyButton: {
      marginTop: 4,
      alignSelf: 'flex-start',
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: colors.background.secondary,
    },
    replyText: {
      fontSize: 12,
      fontFamily: "Chirp_Medium",
      color: colors.text.secondary,
      lineHeight: 12 * 1.2
    },
    likesCount: {
      fontSize: 12,
      color: colors.text.tertiary,
      fontFamily: "Chirp_Regular",
    },

    // View/hide replies controls
    viewAllRepliesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -8,
      marginBottom: 12,
      marginLeft: 40,
    },
    viewAllRepliesButton: {
      padding: 4,
    },
    viewAllRepliesText: {
      fontSize: 12,
      fontFamily: "Chirp_Medium",
      color: colors.text.tertiary,
    },
    viewAllRepliesTextInactive: {
      fontSize: 12,
      fontFamily: "Chirp_Medium",
      color: colors.text.tertiary,
    },
    lineHorizontal: {
      width: 15,
      height: 1.5,
      marginTop: 2,
      backgroundColor: colors.border.light,
    },
    lineHorizontalInactive: {
      width: 15,
      height: 1.5,
      marginTop: 2,
      backgroundColor: colors.border.light,
    },

    // Input container
    inputContainerWrapper: {
      width: '100%',
      paddingTop: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background.primary,
      borderTopColor: colors.border.light,
      borderTopWidth: 0.3,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999999,
      elevation: 999999,
      
    },
    inputContainer: {
      width: '100%',
      flex: 1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 6,
      paddingBottom: 8,
      gap: 8,
    },
    inputWrapper: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 40,
      maxHeight: 120,
      position: 'relative',
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.light,
    },
    input: {
      fontSize: 15,
      lineHeight: 20,
      paddingTop: 4,
      paddingBottom: 4,
      textAlignVertical: 'center',
      color: colors.text.primary,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: 2,
      backgroundColor: 'transparent',
      borderColor: colors.border.light,
    },
    sendButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    // Reply badge
    replyingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
      paddingHorizontal: 8,
    },
    replyingText: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    replyingUsername: {
      color: colors.primary,
      fontFamily: "Chirp_Regular",
    },
    cancelReplyButton: {
      padding: 2,
    },

    // Suggestions
    suggestionsContainer: {
      position: 'absolute',
      bottom: 80,
      left: 10,
      right: 10,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: 60,
      zIndex: 1000,
      paddingVertical: 8,
      backgroundColor: colors.background.secondary,
    },
    suggestionsScroll: {
      maxHeight: 200,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginHorizontal: 5,
      borderRadius: 20,
      backgroundColor: colors.background.tertiary,
    },
    suggestionAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 6,
    },
    suggestionText: {
      fontSize: 14,
      fontFamily: "Chirp_Regular",
      color: colors.text.primary,
    },
    hashtagIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
    },
    hashtagIconText: {
      color: colors.text.inverse,
      fontFamily: "Chirp_Bold",
    },
  });
};