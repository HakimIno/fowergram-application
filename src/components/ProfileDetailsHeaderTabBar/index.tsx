import { Animated, I18nManager, Pressable, StyleSheet, Text, Vibration, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons';

const ProfileDetailsHeaderTabBar = ({ navigationState, position, jumpTo, tabs }: any) => {
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
               
                return (
                    <Pressable
                        key={`${route.name}_${index}`}
                        style={{ flex: 0.5, overflow: 'hidden' }}
                        onPress={onPress}
                    >
                        <View style={styles.iconTextContainer}>
                            <Ionicons name={isFocused ? tabs[index].iconActive : tabs[index].icon} size={26} color={"black"} />
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export default ProfileDetailsHeaderTabBar

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        // backgroundColor: 'rgba(229, 231, 235, 0.3)',
        backgroundColor: 'white',
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0, 0, 0, 0.2)",
    },
    tabBgColor: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(229, 231, 235, 0.1)',
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
    },
})