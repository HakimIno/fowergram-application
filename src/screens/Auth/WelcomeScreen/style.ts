import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    logoContainer: {
        height: height * 0.3,
        marginTop: height * 0.06,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    subtitleText: {
        fontFamily: 'Chirp_Regular',
        color: '#6b7280',
        fontSize: 14,
        lineHeight: 14 * 1.4,
        textAlign: 'center',
        paddingHorizontal: 20
    },
    savedAccountsContainer: {
        width: '100%',
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    savedAccountsTitle: {
        fontFamily: 'Chirp_Bold',
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 10,
    },
    accountsList: {
        maxHeight: height * 0.2,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    accountAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    accountAvatarText: {
        fontFamily: 'Chirp_Bold',
        fontSize: 16,
        color: '#4b5563',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        color: '#000',
    },
    accountEmail: {
        fontFamily: 'Chirp_Regular',
        fontSize: 12,
        color: '#6b7280',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 80,
    },
    loginButton: {
        backgroundColor: '#000',
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',

    },
    loginButtonText: {
        color: '#fff',
        fontFamily: 'Chirp_Bold',
        lineHeight: 14 * 1.4
    },
    registerButton: {
        backgroundColor: '#fff',
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16
    },
    registerButtonText: {
        color: '#000',
        fontFamily: 'Chirp_Bold',
        lineHeight: 14 * 1.4
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 20
    },
    footerText: {
        fontFamily: 'Chirp_Regular',
        color: '#6b7280',
        fontSize: 12,
        lineHeight: 12 * 1.4
    },
    noAccountsText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default styles; 