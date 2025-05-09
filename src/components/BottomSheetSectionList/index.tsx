import { Dimensions, FlatListProps, StyleSheet, View, SectionList, Text, Image, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableNativeFeedback, TouchableOpacity, Vibration } from 'react-native';
import React, {
    forwardRef,
    useImperativeHandle,
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    useAnimatedScrollHandler,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import BackDrop from '../BackDrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Accordion from '../Accordion';
import AccordionMain from '../ReadMoreText';
import ReadMoreText from '../ReadMoreText';
import { Ionicons } from '@expo/vector-icons';
import { EmojiCell } from '../EmojiCell';
import BottomSheet from '../BottomSheet';

interface Props extends FlatListProps<any> {
    snapTo: string;
    backgroundColor: string;
    backDropColor: string;
    handleClose: () => void;
}

export interface BottomSheetMethods {
    expand: () => void;
    close: () => void;
}

const BottomSheetSectionList = forwardRef<BottomSheetMethods, Props>(
    (
        { snapTo, handleClose, renderItem, backgroundColor, backDropColor, data, ...rest }: Props,
        ref,
    ) => {
        const inset = useSafeAreaInsets();
        const inputRef = useRef<TextInput>(null);
        const bottomSheetRef = useRef<BottomSheetMethods>(null);
        const { height } = Dimensions.get('screen');
        const { width, height: heightW } = Dimensions.get('window');
        const percentage = parseFloat(snapTo.replace('%', '')) / 100;
        const closeHeight = height;
        const openHeight = height - height * percentage;
        const topAnimation = useSharedValue(closeHeight);
        const context = useSharedValue(0);
        const scrollBegin = useSharedValue(0);
        const scrollY = useSharedValue(0);
        const [enableScroll, setEnableScroll] = useState(true);

        const LARGE_SCREEN_THRESHOLD = 800;
        const openHeightInput = heightW > LARGE_SCREEN_THRESHOLD ? heightW * 0.58 : heightW * 0.56;

        const topAnimationInput = useSharedValue(closeHeight);
        const translateYAnimationInput = useSharedValue(0);
        const bottomAnimationInput = useSharedValue(0);

        const expand = useCallback(() => {
            'worklet';
            topAnimation.value = withTiming(openHeight);
            topAnimationInput.value = withTiming(openHeightInput);
            bottomAnimationInput.value = withTiming(1)
        }, [openHeight, topAnimationInput, topAnimation, bottomAnimationInput]);

        const close = useCallback(() => {
            'worklet';
            topAnimation.value = withTiming(closeHeight);
            topAnimationInput.value = withTiming(closeHeight);
            bottomAnimationInput.value = withTiming(0)
            handleClose()
        }, [closeHeight, topAnimationInput, topAnimation, handleClose, bottomAnimationInput]);


        useImperativeHandle(
            ref,
            () => ({
                expand,
                close,
            }),
            [expand, close],
        );

        const [keyboardHeight, setKeyboardHeight] = useState(0);

        const handleKeyboardDidShow = useCallback((event: { duration: any; endCoordinates: { height: React.SetStateAction<number>; }; }) => {
            translateYAnimationInput.value = withTiming(1, { duration: event.duration });
            setKeyboardHeight(event.endCoordinates.height);
        }, [translateYAnimationInput, setKeyboardHeight]);

        const handleKeyboardDidHide = useCallback((event: { duration: any; }) => {
            translateYAnimationInput.value = withTiming(0, { duration: event.duration });
        }, [translateYAnimationInput]);

        useEffect(() => {
            const keyboardWillShow = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
            const keyboardWillHide = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

            return () => {
                keyboardWillShow.remove();
                keyboardWillHide.remove();
            };
        }, [handleKeyboardDidShow, handleKeyboardDidHide]);


        const animationStyle = useAnimatedStyle(() => {
            const top = topAnimation.value;
            return {
                top,
            };
        });



        const animationStyleInput = useAnimatedStyle(() => {
            const top = topAnimationInput.value;
            const heightInput = heightW > LARGE_SCREEN_THRESHOLD ? heightW * 0.08 : heightW * 0.1;

            return {
                top: bottomAnimationInput.value === 0 ?
                    top + -(translateYAnimationInput.value * heightInput * 0.25 / 2.5)
                    : top + (translateYAnimationInput.value * heightInput * 0.25 / 2.5),
                paddingBottom: openHeightInput * 0.25 - 100,
                height: openHeightInput,
                transform: [{ translateY: -(translateYAnimationInput.value * keyboardHeight) }],
            };
        });



        const DATA = [
            {
                title: '',
                data: [''],
            },
            {
                title: '200 ความคิดเห็น ',
                data: [
                    {

                    },
                    {
                        username: "kimsnow",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "kimsnow",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                    {
                        username: "baby",
                        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        image: "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70.jpg"
                    },
                ],
            },

        ];
        const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante  dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.  Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue  semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.
#facebook #ig #love`


        const emojiData = [
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/happy.png", emojiValue: "😆" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/cry.png", emojiValue: "😭" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/angry.png", emojiValue: "😡" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/wronged.png", emojiValue: "☺" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/drool.png", emojiValue: "😍" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/yummy.png", emojiValue: "👍" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/funnyface.png", emojiValue: "😝" },
            { emojiImg: "https://em-content.zobj.net/content/2020/07/27/scream.png", emojiValue: "😮" },
        ]

        const [textInput, setTextInput] = useState("")

        const upIcon = useSharedValue(0)
        const icon2Style = useAnimatedStyle(() => {
            return {
                opacity: interpolate(upIcon.value, [0, 1], [0, 1], "clamp"),
                transform: [
                    { scale: interpolate(upIcon.value, [0, 1], [0, 1], "clamp") },
                ],
            };
        });

        useEffect(() => {
            upIcon.value = withTiming(textInput.length > 0 ? 1 : 0, {
                duration: 200,
            });
        }, [textInput.length]);

        const handleChange = (text: React.SetStateAction<string>) => {
            const lines = String(text).split('\n').length;
            if (lines <= 1) {
                setTextInput(text);
            }
        };

        const handleEmojiSelect = (emojiValue: string) => {
            setTextInput((prevText) => prevText + emojiValue);
        };


        return (
            <>
                <BackDrop
                    topAnimation={topAnimation}
                    backDropColor={backDropColor}
                    closeHeight={closeHeight}
                    openHeight={openHeight}
                    close={close}
                />
                <Animated.View
                    style={[
                        styles.container,
                        animationStyle,
                        {
                            backgroundColor: backgroundColor,
                            paddingBottom: inset.bottom,
                        },
                    ]}>
                    <View style={styles.lineContainer}>
                        <View style={styles.line} />
                    </View>

                    <SectionList
                        {...rest}
                        sections={DATA}
                        keyExtractor={(item, index) => item + index}
                        scrollEnabled={enableScroll}
                        renderItem={({ item, index }) => (
                            <View style={{
                                backgroundColor: 'white',
                                paddingHorizontal: 10,
                                paddingVertical: index === 0 ? 0 : 10
                            }}>
                                {item === "" && index === 0 && (
                                    <View style={{ paddingHorizontal: 10 }}>
                                        <ReadMoreText
                                            numberOfLines={4}
                                            readMoreText={"เพิ่มเติม"}
                                            readLessText={"ย่อน้อยลง"}
                                            style={styles.textBody}
                                            readMoreStyle={{ color: "#CACACA", fontFamily: 'Chirp_Bold', }}
                                            readLessStyle={{ color: "#CACACA" }}>{longText}</ReadMoreText>
                                    </View>
                                )}
                                {index > 0 ? (
                                    <View >
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 10 }}>
                                            <Image
                                                source={{ uri: item.image }}
                                                style={[{ width: 45, height: 45, borderRadius: 45 }]}
                                            />
                                            <View style={{ width: "80%", marginLeft: 5, }}>
                                                <Text style={[styles.textBody, { fontFamily: 'Chirp_Bold', }]}>{item.username}</Text>
                                                <Text style={[styles.textBody]}>{item.message}</Text>
                                            </View>
                                            <Pressable
                                                style={{
                                                    padding: 5,
                                                    borderRadius: 100,
                                                    backgroundColor: "#f3f4f6"
                                                }}>
                                                <Ionicons name="heart-outline" size={22} color="black" />
                                            </Pressable>
                                        </View>

                                    </View>
                                ) : null}
                            </View>



                        )}
                        renderSectionHeader={({ section: { title } }) => (
                            title === "" ? null : (
                                <View style={[styles.header, { paddingVertical: 5 }]}>
                                    <Text style={styles.textHeader}>{title}</Text>
                                </View>
                            )
                        )}
                        contentContainerStyle={{ paddingBottom: height * 0.1 }}
                        // onScroll={onScroll}
                        bounces={false}
                        scrollEventThrottle={16}
                        stickySectionHeadersEnabled
                    />

                    <Animated.View
                        style={[
                            animationStyleInput,
                            {
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                padding: 10,
                                backgroundColor: 'white',
                                borderTopWidth: 0.5,
                                borderTopColor: "#d1d5db",
                            },
                        ]}>


                        <View style={{ gap: 12 }}>
                            <FlatList
                                data={emojiData}
                                horizontal
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ marginHorizontal: width > 400 && Platform.OS === "ios" ? 10 : 8, }}>
                                        <EmojiCell
                                            emoji={item.emojiImg}
                                            colSize={30}
                                            onPress={() => handleEmojiSelect(item.emojiValue)}
                                        />
                                    </View>
                                )}
                            />

                            <View style={{ flexDirection: 'row' }}>
                                <Image
                                    source={{ uri: "https://em-content.zobj.net/source/telegram/386/clown-face_1f921.webp" }}
                                    style={[{ width: 40, height: 40, borderRadius: 40 }]}
                                />
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        ref={inputRef}
                                        style={styles.input}
                                        placeholder="Enter your text here"
                                        maxLength={256}
                                        value={textInput}
                                        onChangeText={handleChange}

                                    />
                                    <Animated.View style={[styles.iconContainer, icon2Style]}>
                                        <TouchableOpacity onPress={() => Vibration.vibrate(15)}>
                                            <Ionicons name="arrow-up-circle" size={38} color="#1a1a1a" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                            </View>
                        </View>

                    </Animated.View>
                </Animated.View>
            </>
        );
    },
);

export default BottomSheetSectionList;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    lineContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    line: {
        width: 50,
        height: 4,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
    },
    header: {
        backgroundColor: 'white',
        paddingVertical: 5
    },
    textHeader: {
        fontFamily: 'Chirp_Bold',
        color: "#242424",
        marginHorizontal: 20,
    },
    textBody: {
        fontFamily: 'Chirp_Medium',
        color: "#242424",
    },
    // input: {
    //     textAlignVertical: 'center',
    //     backgroundColor: "rgba(229, 231, 235, 0.5)",
    //     borderRadius: 20,
    //     width: "85%",
    //     padding: 10,
    //     alignItems: 'center'

    // },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "85%",
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        borderRadius: 20,
    },
    input: {
        flex: 1,
        textAlignVertical: 'center',
        width: "85%",
        padding: 10,
        fontFamily: 'Chirp_Medium',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 100,
    },
});