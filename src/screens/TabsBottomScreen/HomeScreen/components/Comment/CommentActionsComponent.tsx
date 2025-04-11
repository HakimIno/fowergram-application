import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommentItem } from './types';
import { MotiView } from 'moti';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { withTiming } from 'react-native-reanimated'; // เพิ่ม withTiming สำหรับแอนิเมชันที่นุ่มนวล
import * as Haptics from 'expo-haptics';

interface CommentActionsComponentProps {
    item: CommentItem;
    onLike: (id: string, isReply: boolean) => void;
    styles: any;
    colors: any;
}

const CommentActionsComponent: React.FC<CommentActionsComponentProps> = ({
    item,
    onLike,
    styles,
    colors
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handleLikePress = async () => {
        scale.value = withTiming(1.3, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 100 }); // หดกลับ
        });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLike(item.id, item.isReply || false);
    };

    return (
        <View style={styles.actionsContainer}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLikePress} // ใช้ฟังก์ชันที่จัดการแอนิเมชัน
            >
                <MotiView

                    style={animatedStyle}>
                    <Ionicons
                        name={item.isLiked ? 'flower-sharp' : 'flower-outline'}
                        size={18}
                        color={item.isLiked ? colors.primary : colors.text.tertiary}
                    />
                </MotiView>
                {item.likes > 0 && (
                    <Text style={[styles.likesCount, { color: item.isLiked ? colors.primary : colors.text.tertiary }]}>
                        {item.likes}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default CommentActionsComponent;