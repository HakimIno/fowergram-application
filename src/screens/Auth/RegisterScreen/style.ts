import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100, // ให้มีพื้นที่ว่างด้านล่างเพื่อไม่ให้ปุ่มบัง
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
        marginTop: 20,
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
        marginBottom: 6, // ลด margin เมื่อมี error text อยู่ด้านล่าง
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    inputStatusIcon: {
        position: 'absolute',
        right: 15,
        zIndex: 1,
    },
    passwordToggle: {
        position: 'absolute',
        right: 15,
        zIndex: 1,
    },
    textInfoSubTitle: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    input: {
        flex: 1,
        paddingLeft: 45,
        textAlignVertical: 'center',
        fontFamily: 'Chirp_Regular',
        borderRadius: 16,
        height: 50,
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
});

export default styles;
