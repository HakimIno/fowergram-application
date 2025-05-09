import { Animated, I18nManager, Pressable, StyleSheet, Text, Vibration, View } from 'react-native'
import React, { useRef } from 'react'
import { Ionicons } from '@expo/vector-icons';

const HeaderTabBar = ({ navigationState, position, jumpTo, tabs }: any) => {
    const layoutWidth = useRef(0);
    return (
        <View
            onLayout={e => (layoutWidth.current = e.nativeEvent.layout.width)}
            style={styles.tabsContainer}
        >
            {navigationState.routes.map((route: { key: any; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined }, index: number) => {
                const isFocused = navigationState.index === index;
                const onPress = () => {
                    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                    Vibration.vibrate(30)
                    !isFocused && jumpTo(route.key)
                };

                const inputRange = navigationState.routes.map((_: any, i: any) => i);
                const translateX = (isText = false) =>
                    Animated.multiply(
                        position.interpolate({
                            inputRange,
                            outputRange: inputRange.map((i: number) => {
                                const diff = i - index;
                                const x = layoutWidth.current / tabs.length;
                                const value = diff > 0 ? x : diff < 0 ? -x : 0;
                                return !isText ? value : -value;
                            }),
                        }),
                        I18nManager.isRTL ? -1 : 1
                    );
                return (
                    <Pressable
                        key={`${route.name}_${index}`}
                        style={{ flex: 0.5, overflow: 'hidden' }}
                        onPress={onPress}
                    >

                        <View style={styles.iconTextContainer}>
                            <Ionicons name={tabs[index].icon} size={20} color={index === 0 ? "#1a1a1a" : "#1a1a1a"} />
                            <Text style={{ color: '#242424', fontFamily: 'Chirp_Medium', }}>{tabs[index].name}</Text>
                        </View>

                        <Animated.View
                            style={[
                                styles.tabBgColor,
                                {
                                    overflow: 'hidden',
                                    transform: [{ translateX: translateX() }],
                                    borderColor: index === 0 ? "#1a1a1a" : "#1a1a1a"
                                },
                            ]}
                        >
                            <Animated.View style={[
                                styles.iconTextContainer,
                                { transform: [{ translateX: translateX(true) }] }]}>
                                <Ionicons name={tabs[index].iconActive} size={20} color={index === 0 ? "#1a1a1a" : "#1a1a1a"} />
                                <Text style={{ color: '#1a1a1a', fontFamily: 'Chirp_Bold', marginLeft: 3 }}>{tabs[index].name}</Text>
                            </Animated.View>
                        </Animated.View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default HeaderTabBar

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 3,
        backgroundColor: '#F5F5F5',
        borderRadius: 100
    },
    tabBgColor: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F5F5F5',
        borderRadius: 100
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
})