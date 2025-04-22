import { ActivityIndicator, Dimensions, GestureResponderEvent, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, NativeScrollEvent, NativeSyntheticEvent, FlatList } from 'react-native'
import React, { useContext, useRef, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthContext } from 'src/contexts/auth.context'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { useTheme } from 'src/context/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import { RouteProp } from '@react-navigation/native'

const { width, height } = Dimensions.get("window")

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
        }
    };

    const handleItemPress = (index: number) => {
        setSelectedIndex(index);
        onChange(data[index]);

        scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: true
        });
    };

    const renderItems = () => {
        return data.map((item, index) => (
            <Pressable
                key={index.toString()}
                style={[
                    styles.pickerItem,
                    { height: ITEM_HEIGHT },
                    selectedIndex === index && styles.selectedItem
                ]}
                onPress={() => handleItemPress(index)}
            >
                <Text
                    style={[
                        styles.pickerItemText,
                        selectedIndex === index && styles.selectedItemText
                    ]}
                >
                    {item}
                </Text>
            </Pressable>
        ));
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

    const [day, setDay] = useState('1');
    const [month, setMonth] = useState('1');
    const [year, setYear] = useState('2000');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [validDays, setValidDays] = useState<string[]>([]);

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
        // Here you would make API call to create an account with all the info
        console.log('Creating account with:', {
            username,
            password,
            birthday: `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}` // Format as DD/MM/YYYY
        });
        
        // Navigate to login or home screen after account creation
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <LinearGradient
                colors={["#fff", '#fff', '#fff', "#fff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                <View style={styles.scrollViewContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerContainer}>
                            <StatusBar style="auto" />

                            <View style={styles.logoContainer}>
                                <FlowergramLogo
                                    width={200}
                                    height={70}
                                    fontSize={40}
                                    theme={{ textColor: "#000" }}
                                />
                                <Text style={styles.subtitleText}>กรอกวันเกิดของคุณ</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.formLabel}>วันเกิดของคุณ</Text>

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

                                <Text style={styles.helperText}>
                                    ข้อมูลวันเกิดของคุณจะไม่ถูกแสดงต่อสาธารณะ
                                </Text>
                            
                            </View>
                            <View style={styles.spacer} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <Pressable
                    style={[
                        styles.btnContainer,
                        {
                            position: 'absolute',
                            bottom: keyboardVisible ? 10 : insets.bottom + 20,
                            left: 20,
                            right: 20
                        }
                    ]}
                    onPress={handleCreateAccount}
                >
                    <Text style={[styles.textInfoSubTitle, { color: "white" }]}>สร้างบัญชี</Text>
                </Pressable>
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

export default RegisterBirthdayScreen

const styles = StyleSheet.create({
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
        height: height * 0.25,
        marginTop: height * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    subtitleText: {
        fontFamily: 'Chirp_Regular',
        color: '#6b7280',
        fontSize: 13,
        marginTop: 8,
        lineHeight: 13 * 1.4
    },
    formContainer: {
        alignItems: 'flex-start',
        width: "100%",
        alignSelf: 'center',
        marginTop: 20,
        paddingHorizontal: 20
    },
    formLabel: {
        fontFamily: 'Chirp_Medium',
        fontSize: 16,
        color: '#000',
        marginBottom: 24,
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
        marginTop: 8,
    },
    dateLabel: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Chirp_Regular',
        fontSize: 14,
        color: '#6b7280',
    },
    pickerContainer: {
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    pickerSelectionIndicator: {
        position: 'absolute',
        height: ITEM_HEIGHT,
        left: 0,
        right: 0,
        top: ITEM_HEIGHT * 2,
        backgroundColor: 'rgba(229, 231, 235, 0.5)',
        borderRadius: 8,
    },
    pickerItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 16,
        color: '#6b7280',
    },
    selectedItem: {
        backgroundColor: 'transparent',
    },
    selectedItemText: {
        fontFamily: 'Chirp_Medium',
        color: '#000',
    },
    inputWrapper: {
        marginBottom: 16,
        position: 'relative',
    },
    textInfoSubTitle: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    input: {
        width: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        fontFamily: 'Chirp_Regular',
        borderRadius: 16,
        height: 50,
        fontSize: 16,
    },
    helperText: {
        fontFamily: 'Chirp_Regular',
        fontSize: 12,
        color: '#6b7280',
        marginTop: 20,
    },
    birthDatePreview: {
        fontFamily: 'Chirp_Medium',
        fontSize: 14,
        color: '#000',
        marginTop: 12,
        alignSelf: 'center',
    },
    btnContainer: {
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        shadowColor: "#db2777",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 10,
    },
    spacer: {
        flex: 1,
    },
}) 