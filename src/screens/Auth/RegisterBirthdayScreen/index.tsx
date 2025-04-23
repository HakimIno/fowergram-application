import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, NativeScrollEvent, NativeSyntheticEvent, FlatList, Animated } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { LinearGradient } from 'expo-linear-gradient'
import { RouteProp } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'

const { width, height } = Dimensions.get("window")

// Primary color palette
const COLORS = {
    primary: '#4f46e5',
    primaryLight: '#B47CFF',
    secondary: '#03DAC6',
    background: '#FFFFFF',
    surface: '#F5F8FF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#FF4081',
    error: '#CF6679',
    success: '#00C853',
}

type RegisterBirthdayScreenNavigationProp = StackNavigationProp<RootStackParamList, "register_birthday_screen">;
type RegisterBirthdayScreenRouteProp = RouteProp<RootStackParamList, "register_birthday_screen">;

interface RegisterBirthdayScreenProps {
    navigation: RegisterBirthdayScreenNavigationProp;
    route: RegisterBirthdayScreenRouteProp;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

const WheelPicker = ({
    data,
    onChange,
    style,
    defaultValue
}: {
    data: string[];
    onChange: (item: string) => void;
    style?: any;
    defaultValue?: string;
}) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return defaultValue ? Math.max(0, data.indexOf(defaultValue)) : 0;
    });

    // Initialize with default value
    useEffect(() => {
        if (scrollViewRef.current && selectedIndex > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: selectedIndex * ITEM_HEIGHT,
                    animated: false
                });
            }, 50);
        }
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);

        if (index >= 0 && index < data.length && index !== selectedIndex) {
            setSelectedIndex(index);
            onChange(data[index]);
            // Add haptic feedback when selection changes
            Haptics.selectionAsync();
        }
    };

    const handleItemPress = (index: number) => {
        setSelectedIndex(index);
        onChange(data[index]);

        scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: true
        });

        // Add haptic feedback when item is pressed
        Haptics.selectionAsync();
    };

    const renderItems = () => {
        return data.map((item, index) => {
            // Calculate the distance from the selected index to determine opacity
            const distance = Math.abs(selectedIndex - index);
            const opacity = distance === 0 ? 1 : Math.max(0.6 - (distance * 0.15), 0.3);
            const scale = distance === 0 ? 1 : Math.max(0.95 - (distance * 0.05), 0.8);

            return (
                <Pressable
                    key={index.toString()}
                    style={[
                        styles.pickerItem,
                        { height: ITEM_HEIGHT },
                        selectedIndex === index && styles.selectedItem
                    ]}
                    onPress={() => handleItemPress(index)}
                >
                    <Animated.Text
                        style={[
                            styles.pickerItemText,
                            selectedIndex === index && styles.selectedItemText,
                            {
                                opacity,
                                transform: [{ scale }]
                            }
                        ]}
                    >
                        {item}
                    </Animated.Text>
                </Pressable>
            );
        });
    };

    // Padding to make sure items can scroll to center
    const paddingTop = (VISIBLE_ITEMS - 1) / 2 * ITEM_HEIGHT;
    const paddingBottom = paddingTop;

    return (
        <View style={[styles.pickerContainer, style]}>

            <View style={styles.pickerSelectionIndicator} />

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleScroll}
                contentContainerStyle={{
                    paddingTop,
                    paddingBottom
                }}
            >
                {renderItems()}
            </ScrollView>
        </View>
    );
};

const RegisterBirthdayScreen = ({ navigation, route }: RegisterBirthdayScreenProps) => {
    const { username, password } = route.params;
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const [day, setDay] = useState('1');
    const [month, setMonth] = useState('1');
    const [year, setYear] = useState('2000');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [validDays, setValidDays] = useState<string[]>([]);

    // Animation on component mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    // Compute valid days for the current month and year
    const getValidDaysForMonth = (month: number, year: number): string[] => {
        let daysInMonth = 31;

        // Months with 30 days: April (4), June (6), September (9), November (11)
        if ([4, 6, 9, 11].includes(month)) {
            daysInMonth = 30;
        }
        // February special case
        else if (month === 2) {
            // Leap year check: divisible by 4 and (not divisible by 100 or divisible by 400)
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            daysInMonth = isLeapYear ? 29 : 28;
        }

        return Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    };

    // Update valid days when month or year changes
    useEffect(() => {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const newValidDays = getValidDaysForMonth(monthNum, yearNum);
        setValidDays(newValidDays);

        // If current day is invalid for the new month, adjust it to the last valid day
        const dayNum = parseInt(day);
        if (dayNum > newValidDays.length) {
            setDay(String(newValidDays.length));
        }
    }, [month, year]);

    // Initialize valid days on component mount
    useEffect(() => {
        setValidDays(getValidDaysForMonth(parseInt(month), parseInt(year)));
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Month names to display
    const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const monthsData = Array.from({ length: 12 }, (_, i) => {
        return `${monthNames[i]}`;
    });

    // Generate years (current year - 100)
    const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

    const handleCreateAccount = () => {
        Keyboard.dismiss();


        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);


        console.log('Creating account with:', {
            username,
            password,
            birthday: `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}` // Format as DD/MM/YYYY
        });


        navigation.navigate('login_screen');
    };

    const handleMonthChange = (value: string) => {
        // Find the index of the month name in the monthNames array
        const monthIndex = monthNames.indexOf(value);
        if (monthIndex !== -1) {
            // Add 1 because months are 1-indexed
            setMonth(String(monthIndex + 1));
        }
    };

    // Format the display date for preview
    const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <LinearGradient
                colors={[COLORS.background, COLORS.surface, COLORS.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                <StatusBar style="dark" />

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.innerContainer}>
                        <Animated.View
                            style={[
                                styles.logoContainer,
                            ]}
                        >
                            <FlowergramLogo
                                width={200}
                                height={70}
                                fontSize={40}
                                theme={{ textColor: "#000" }}
                            />
                            <Text style={styles.subtitleText}>กรอกวันเกิดของคุณ</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.formContainer,

                            ]}
                        >
                            <Text style={styles.formLabel}>วันเกิดของคุณ</Text>

                            <View style={styles.cardContainer}>
                                <View style={styles.birthdayContainer}>
                                    {/* Day picker */}
                                    <WheelPicker
                                        data={validDays}
                                        onChange={(value) => setDay(value)}
                                        style={{ flex: 1, marginRight: 8 }}
                                        defaultValue={day}
                                    />

                                    {/* Month picker */}
                                    <WheelPicker
                                        data={monthsData}
                                        onChange={handleMonthChange}
                                        style={{ flex: 2, marginHorizontal: 4 }}
                                        defaultValue={monthNames[parseInt(month) - 1]}
                                    />

                                    {/* Year picker */}
                                    <WheelPicker
                                        data={years}
                                        onChange={(value) => setYear(value)}
                                        style={{ flex: 1.5, marginLeft: 8 }}
                                        defaultValue={year}
                                    />
                                </View>

                                <View style={styles.dateLabelsContainer}>
                                    <Text style={styles.dateLabel}>วัน</Text>
                                    <Text style={[styles.dateLabel, { flex: 2 }]}>เดือน</Text>
                                    <Text style={[styles.dateLabel, { flex: 1.5 }]}>ปี</Text>
                                </View>

                                <View style={styles.datePreviewContainer}>
                                    <AntDesign name="calendar" size={16} color={"#000"} />
                                    <Text style={styles.birthDatePreview}>{formattedDate}</Text>
                                </View>
                            </View>

                            <View style={styles.infoContainer}>
                                <AntDesign name="infocirlceo" size={16} color={COLORS.textSecondary} style={styles.infoIcon} />
                                <Text style={styles.helperText}>
                                    ข้อมูลวันเกิดของคุณจะไม่ถูกแสดงต่อสาธารณะ
                                </Text>
                            </View>
                        </Animated.View>

                        <View style={styles.spacer} />
                    </View>
                </TouchableWithoutFeedback>

                <Pressable
                    style={({ pressed }) => [
                        styles.btnContainer,
                        {
                            position: 'absolute',
                            bottom: keyboardVisible ? 10 : insets.bottom + 20,
                            left: 20,
                            right: 20,

                        }
                    ]}
                    onPress={handleCreateAccount}
                >
                    <Text style={[styles.buttonText, { color: 'white' }]}>สร้างบัญชี</Text>
                </Pressable>
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

export default RegisterBirthdayScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    logoContainer: {
        height: height * 0.22,
        marginTop: height * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    subtitleText: {
        fontFamily: 'Chirp_Regular',
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 8,
        lineHeight: 14 * 1.4
    },
    formContainer: {
        alignItems: 'flex-start',
        width: "100%",
        alignSelf: 'center',
        marginTop: 20,
    },
    formLabel: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 16,
        lineHeight: 14 * 1.4
    },
    cardContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
       
    },
    birthdayContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
    },
    dateLabelsContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 4,
        marginBottom: 16,
        paddingHorizontal: 6,
    },
    dateLabel: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Chirp_Regular',
        fontSize: 13,
        lineHeight: 13 * 1.4,
        color: COLORS.textSecondary,
    },
    datePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(87, 87, 87, 0.1)',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 4,
    },
    infoIcon: {
        marginRight: 8,
    },
    pickerContainer: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        overflow: 'hidden',
        justifyContent: 'center',
        borderRadius: 12,
    },
    pickerGradientTop: {
        position: 'absolute',
        height: ITEM_HEIGHT * 2,
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1,
    },
    pickerGradientBottom: {
        position: 'absolute',
        height: ITEM_HEIGHT * 2,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    pickerSelectionIndicator: {
        position: 'absolute',
        height: ITEM_HEIGHT,
        left: 4,
        right: 4,
        top: ITEM_HEIGHT * 2,
        backgroundColor: 'rgba(177, 177, 177, 0.1)',
        borderRadius: 16,
        zIndex: 0,
    },
    pickerItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    selectedItem: {
        backgroundColor: 'transparent',
    },
    selectedItemText: {
        fontFamily: 'Chirp_Medium',
        color: "#000",
        fontSize: 18,
    },
    helperText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
    },
    birthDatePreview: {
        fontFamily: 'Chirp_Medium',
        fontSize: 15,
        color: '#000',
        marginLeft: 8,
    },
    btnContainer: {
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        shadowColor: "#f43f5e",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 10,
    },
    buttonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    spacer: {
        flex: 1,
    },
}) 