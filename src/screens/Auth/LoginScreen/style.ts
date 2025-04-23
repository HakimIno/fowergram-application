import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    innerContainer: {
        flex: 1,
    },
    logoContainer: {
        marginTop: height * 0.06,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginHorizontal: 20,
        gap: 20
    },
    accountContainer: {
        marginTop: height * 0.02,
        alignItems: 'flex-start',
        width: '100%',
        marginHorizontal: 25
    },
    subtitleText: {
        fontFamily: 'Chirp_Bold',
        color: '#000',
        fontSize: 20,
        lineHeight: 20 * 1.4
    },
    titleText: {
        fontFamily: 'Chirp_Bold',
        color: '#4b5563',
        fontSize: 13,
        marginTop: 8,
        lineHeight: 13 * 1.4
    },
    formContainer: {
        alignItems: 'center',
        width: "100%",
        alignSelf: 'center',
        marginTop: 10,
        paddingHorizontal: 20
    },
    inputWrapper: {
        width: "100%",
        marginBottom: 16,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWrapperError: {
        marginBottom: 6,
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    passwordToggle: {
        position: 'absolute',
       
        zIndex: 1,
        backgroundColor: 'rgba(177, 177, 177, 0.1)',
        borderRadius: 8,
        padding: 6
    },
    inputTypeIndicator: {
        position: 'absolute',
        right: 15,
        top: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    inputTypeText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 10,
        color: '#6b7280',
        lineHeight: 10 * 1.4
    },
    textInfoSubTitle: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    input: {
        flex: 1,
        paddingLeft: 45,
        paddingRight: 15,
        textAlignVertical: 'center',
        fontFamily: 'Chirp_Regular',
        borderRadius: 16,
        height: 50,
        fontSize: 16,
    },
    btnContainer: {
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    spacer: {
        flex: 1,
    },
    helpLinksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 30
    },
    helpLinkText: {
        fontFamily: 'Chirp_Medium',
        fontSize: 12,
        marginTop: 16,
        lineHeight: 12 * 1.4
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingLeft: 4,
        fontFamily: 'Chirp_Regular',
        lineHeight: 12 * 1.4
    },
    generalError: {
        marginTop: 4,
        marginBottom: 16,
        textAlign: 'center',
        alignSelf: 'center',
        paddingLeft: 0,
    },
});

export default styles; 