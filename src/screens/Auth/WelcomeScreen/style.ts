import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    logoContainer: {
        height: height * 0.4,
        marginTop: height * 0.1,
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
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 30,
        marginTop: height * 0.05
    },
    loginButton: {
        backgroundColor: '#000',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    loginButtonText: {
        color: '#fff',
        fontFamily: 'Chirp_Bold',
        fontSize: 16
    },
    registerButton: {
        backgroundColor: '#fff',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    registerButtonText: {
        color: '#000',
        fontFamily: 'Chirp_Bold',
        fontSize: 16
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
    }
});

export default styles; 