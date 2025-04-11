// import React, { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
// import { View, Pressable, Text, StyleSheet, PanResponder } from 'react-native';
// import { MotiView } from 'moti';
// import { Canvas, Path, Skia } from '@shopify/react-native-skia';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { Easing, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
// import * as Haptics from 'expo-haptics';

// interface CommentItem {
//     id: string;
//     isReply?: boolean;
//     likes: number;
//     username: string;
//     parentId?: string;
//     isLiked: boolean;
//     reaction?: string;
// }

// interface CommentActionsProps {
//     item: CommentItem;
//     handleLike: (id: string, isReply: boolean, reaction?: string) => void;
//     handleReply: (id: string, username: string) => void;
//     colors: {
//         secondary: string;
//         primary: string;
//         text: {
//             tertiary: string;
//         };
//     };
// }

// // Pre-create petalPath outside component to avoid recreation
// const PETAL_PATH = (() => {
//     const path = Skia.Path.Make();
//     path.moveTo(0, 0);
//     path.cubicTo(-0, -10, 0, -10, 10, -10);
//     path.cubicTo(10, -5, 10, 0, 0, 5);
//     path.close();
//     return path;
// })();

// // Precompute rotation transforms for better performance
// const ROTATIONS = [
//     [{ translateX: -7.5 }, { translateY: -5 }],
//     [{ translateX: -7.5 }, { translateY: -5 }, { rotate: (72 * Math.PI) / 180 }],
//     [{ translateX: -7.5 }, { translateY: -5 }, { rotate: (144 * Math.PI) / 180 }],
//     [{ translateX: -7.5 }, { translateY: -5 }, { rotate: (216 * Math.PI) / 180 }],
//     [{ translateX: -7.5 }, { translateY: -5 }, { rotate: (288 * Math.PI) / 180 }]
// ];

// // Maximum number of particles to show at once
// const MAX_PARTICLES = 8;

// // Available reactions
// const REACTIONS = [
//     { emoji: '❤️', name: 'heart' },
//     { emoji: '👍', name: 'like' },
//     { emoji: '😍', name: 'love' },
//     { emoji: '😂', name: 'laugh' },
//     { emoji: '😢', name: 'sad' },
//     { emoji: '😠', name: 'angry' }
// ];

// // Get emoji by reaction name
// const getEmojiByName = (name: string) => {
//     const reaction = REACTIONS.find(r => r.name === name);
//     return reaction ? reaction.emoji : null;
// };

// const FlowerParticle = memo(({ id, onComplete, targetX, targetY }: {
//     id: number;
//     onComplete: (id: number) => void;
//     targetX: number;
//     targetY: number;
// }) => {
//     const COLOR_OPTIONS = [
//         "#818cf8",
//         "#bef264",
//         "#2dd4bf",
//         "#34d399",
//     ];

//     const randomValues = useMemo(() => ({
//         rotation: Math.random() * 360,
//         color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
//     }), []);

//     return (
//         <MotiView
//             from={{
//                 translateY: 10,
//                 translateX: -0,
//                 opacity: 0,
//                 scale: 1.5,
//                 rotate: `${randomValues.rotation}deg`,
//             }}
//             animate={{
//                 translateY: [
//                     { value: -3, type: 'timing', easing: Easing.out(Easing.ease) },
//                     { value: targetY, type: 'timing', easing: Easing.out(Easing.ease) },
//                 ],
//                 translateX: [
//                     { value: -8, type: 'timing', easing: Easing.out(Easing.ease) },
//                     { value: targetX, type: 'timing', easing: Easing.out(Easing.ease) },
//                 ],
//                 opacity: [1, 0.8, 0],
//                 scale: [1.5, 1.8, 2],
//             }}
//             transition={{
//                 translateY: { duration: 300 },
//                 translateX: { duration: 300, easing: Easing.ease },
//                 opacity: { duration: 300, easing: Easing.linear },
//                 scale: { duration: 300, easing: Easing.ease },
//                 rotate: { duration: 300, easing: Easing.ease },
//             }}
//             style={styles.petalContainer}
//             onDidAnimate={(key, finished) => {
//                 if (key === 'opacity' && finished) {
//                     onComplete(id);
//                 }
//             }}
//             exitTransition={{
//                 type: 'timing',
//                 duration: 100,
//             }}
//         >
//             <Canvas style={styles.petalCanvas}>
//                 {ROTATIONS.map((transform, index) => (
//                     <Path
//                         key={`petal-${id}-${index}`}
//                         path={PETAL_PATH}
//                         color={"#fcf"}
//                         style="stroke"
//                         transform={transform}
//                         strokeWidth={1.5}
//                     />
//                 ))}
//             </Canvas>
//         </MotiView>
//     );
// });

// const ReplyButton = memo(({ onPress }: { onPress: () => void }) => {
//     return (
//         <Pressable
//             style={styles.actionButton}
//             onPress={onPress}
//             delayHoverIn={0}
//             delayLongPress={50}
//             unstable_pressDelay={0}
//         >
//             <Text style={styles.replyText}>ตอบกลับ</Text>
//         </Pressable>
//     );
// });

// const CommentActions: React.FC<CommentActionsProps> = ({
//     item,
//     handleLike,
//     handleReply,
//     colors
// }) => {
//     const [particles, setParticles] = useState<number[]>([]);
//     const [hasAnimated, setHasAnimated] = useState<boolean>(false);
//     const scale = useSharedValue(1);
//     const [likesPosition, setLikesPosition] = useState({ x: 0, y: 0 });
//     const [showReactions, setShowReactions] = useState(false);
//     const [selectedReactionIndex, setSelectedReactionIndex] = useState(-1);
//     const [currentReaction, setCurrentReaction] = useState<string | undefined>(item.reaction);
//     const [isDragging, setIsDragging] = useState(false);
//     const initialRender = useRef(true);

//     const longPressTimeout = React.useRef<NodeJS.Timeout | null>(null);
//     const startTouchPosition = useRef({ x: 0, y: 0 });
//     const likeButtonRef = useRef<View>(null);
//     const lastHapticTime = useRef<number>(0);

//     useEffect(() => {
//         if (initialRender.current) {
//             initialRender.current = false;
//             setCurrentReaction(item.reaction);
//             setHasAnimated(item.isLiked);
//         }
//     }, []);

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => true,
//             onMoveShouldSetPanResponder: (evt, gestureState) => {
//                 return showReactions || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
//             },
//             onPanResponderGrant: (evt) => {
//                 startTouchPosition.current = {
//                     x: evt.nativeEvent.locationX,
//                     y: evt.nativeEvent.locationY
//                 };

//                 longPressTimeout.current = setTimeout(() => {
//                     setShowReactions(true);
//                     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//                 }, 200);
//             },
//             onPanResponderMove: (evt, gestureState) => {
//                 if (showReactions && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5)) {
//                     setIsDragging(true);

//                     const reactionsOffset = -70;
//                     const reactionWidth = 44;

//                     const adjustedX = gestureState.moveX - (gestureState.x0 + reactionsOffset);

//                     let index = Math.floor(adjustedX / reactionWidth);

//                     index = Math.max(0, Math.min(REACTIONS.length - 1, index));

//                     if (index !== selectedReactionIndex) {
//                         setSelectedReactionIndex(index);

//                         const now = Date.now();
//                         if (now - lastHapticTime.current > 80) {
//                             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
//                             lastHapticTime.current = now;
//                         }
//                     }
//                 }
//                 else if (!showReactions && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10)) {
//                     if (longPressTimeout.current) {
//                         clearTimeout(longPressTimeout.current);
//                         longPressTimeout.current = null;
//                     }
//                 }
//             },
//             onPanResponderRelease: (evt, gestureState) => {
//                 // Clear long press timer if it exists
//                 if (longPressTimeout.current) {
//                     clearTimeout(longPressTimeout.current);
//                     longPressTimeout.current = null;
//                 }

//                 // If reactions are showing and we have a valid selection
//                 if (showReactions && selectedReactionIndex >= 0 && selectedReactionIndex < REACTIONS.length) {
//                     // Apply the selected reaction
//                     const selectedReaction = REACTIONS[selectedReactionIndex].name;
//                     handleReactionSelect(selectedReaction);
//                 }
//                 // Short tap with no drag - treat as normal like
//                 else if (!isDragging && !showReactions && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
//                     handleLikePress();
//                 }

//                 // Reset states
//                 setShowReactions(false);
//                 setIsDragging(false);
//                 setSelectedReactionIndex(-1);
//             },
//             onPanResponderTerminate: () => {
//                 // Clear any pending timers
//                 if (longPressTimeout.current) {
//                     clearTimeout(longPressTimeout.current);
//                     longPressTimeout.current = null;
//                 }

//                 // Reset states
//                 setShowReactions(false);
//                 setIsDragging(false);
//                 setSelectedReactionIndex(-1);
//             }
//         })
//     ).current;

//     // Clean up particles when component unmounts
//     useEffect(() => {
//         return () => {
//             setParticles([]);
//             if (longPressTimeout.current) {
//                 clearTimeout(longPressTimeout.current);
//             }
//         };
//     }, []);

//     // Update current reaction when item changes, but avoid triggering animations
//     useEffect(() => {
//         if (!initialRender.current) {
//             setCurrentReaction(item.reaction);
//         }
//     }, [item.reaction]);

//     // Optimized particle clearance
//     const clearParticle = useCallback((id: number) => {
//         setParticles(prev => prev.filter(p => p !== id));
//     }, []);

//     // Handle reaction selection
//     const handleReactionSelect = useCallback((reaction: string) => {
//         setShowReactions(false);
//         setCurrentReaction(reaction);

//         // Handle the specific reaction
//         handleLike(item.id, item.isReply || false, reaction);

//         // Always show animation for reactions
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         // Animate scale
//         scale.value = withSequence(
//             withSpring(1.3, {
//                 damping: 10,
//                 stiffness: 100,
//                 mass: 0.5
//             }),
//             withSpring(1, {
//                 damping: 12,
//                 stiffness: 120,
//                 mass: 0.5
//             })
//         );

//         // Show particles when reacting
//         const timestamp = Date.now();
//         const newParticles = Array.from(
//             { length: MAX_PARTICLES },
//             (_, i) => timestamp + i
//         );
//         setParticles(newParticles);
//         setHasAnimated(true);
//     }, [item.id, item.isReply, handleLike, scale]);

   
//     const handleLikePress = useCallback(() => {
//         const newLikedState = !item.isLiked;

//         handleLike(item.id, item.isReply || false, newLikedState ? currentReaction : undefined);

//         if (newLikedState && !hasAnimated) {
//             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//             // Animate scale
//             scale.value = withSequence(
//                 withSpring(1.3, {
//                     damping: 10,
//                     stiffness: 100,
//                     mass: 0.5
//                 }),
//                 withSpring(1, {
//                     damping: 12,
//                     stiffness: 120,
//                     mass: 0.5
//                 })
//             );

//             // Show particles when liking
//             const timestamp = Date.now();
//             const newParticles = Array.from(
//                 { length: MAX_PARTICLES },
//                 (_, i) => timestamp + i
//             );
//             setParticles(newParticles);
//             setHasAnimated(true);
//         } else if (!newLikedState) {
//             // Lighter haptic feedback when unliking
//             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

//             setParticles([]);
//             setHasAnimated(false);
//             setCurrentReaction(undefined);
//         }
//     }, [item.id, item.isLiked, item.isReply, hasAnimated, handleLike, scale, currentReaction]);

//     const handleReplyPress = useCallback(() => {
//         handleReply(
//             item.isReply ? item.parentId || '' : item.id,
//             item.username
//         );
//     }, [item.id, item.isReply, item.parentId, item.username, handleReply]);

//     useEffect(() => {
//         // Only update hasAnimated state based on isLiked when not in initial render
//         if (!initialRender.current && !item.isLiked) {
//             setHasAnimated(false);
//         }
//     }, [item.isLiked]);

//     const animatedStyle = useAnimatedStyle(() => {
//         return {
//             transform: [{ scale: scale.value }]
//         };
//     });

//     const iconColor = item.isLiked ? colors.primary : colors.text.tertiary;
//     const textColor = item.isLiked ? colors.primary : colors.text.tertiary;

//     // Get emoji to display
//     const displayEmoji = currentReaction && item.isLiked
//         ? getEmojiByName(currentReaction)
//         : null;

//     return (
//         <View style={styles.commentActions}>
//             <View style={styles.likeContainer}>
//                 <View
//                     ref={likeButtonRef}
//                     {...panResponder.panHandlers}
//                     style={styles.actionButton}
//                 >
//                     <View style={styles.iconContainer}>
//                         <MotiView style={animatedStyle}>
//                             {displayEmoji ? (
//                                 <Text style={styles.reactionEmojiIcon}>{displayEmoji}</Text>
//                             ) : (
//                                 <Ionicons
//                                     name={item.isLiked ? 'flower-sharp' : 'flower-outline'}
//                                     size={16}
//                                     color={iconColor}
//                                 />
//                             )}
//                         </MotiView>

//                         <View style={styles.particleCanvas}>
//                             {particles.map((id) => (
//                                 <FlowerParticle
//                                     key={id}
//                                     id={id}
//                                     onComplete={clearParticle}
//                                     targetX={likesPosition.x}
//                                     targetY={likesPosition.y}
//                                 />
//                             ))}
//                         </View>

//                         {item.likes > 0 && (
//                             <Text
//                                 style={[styles.likesCount, { color: textColor }]}
//                                 onLayout={(event) => {
//                                     const { x, y, width, height } = event.nativeEvent.layout;
//                                     setLikesPosition({ x: x + width / 2, y: y + height / 2 });
//                                 }}
//                             >
//                                 {item.likes}
//                             </Text>
//                         )}
//                     </View>
//                 </View>
//             </View>
//             <ReplyButton onPress={handleReplyPress} />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     commentActions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 6,
//     },
//     likeContainer: {
//         position: 'relative',
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginRight: 25,
//     },
//     iconContainer: {
//         position: 'relative',
//         width: 24,
//         height: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//         flexDirection: 'row',
//     },
//     particleCanvas: {
//         position: 'absolute',
//         width: 10,
//         height: 10,
//         top: 0,
//         left: 0,
//     },
//     petalContainer: {
//         position: 'absolute',
//         width: 10,
//         height: 10,
//     },
//     petalCanvas: {
//         width: 10,
//         height: 10,
//     },
//     likesCount: {
//         marginLeft: 4,
//         fontSize: 12,
//     },
//     replyText: {
//         fontSize: 12,
//         color: '#666',
//     },
//     reactionEmojiIcon: {
//         fontSize: 16,
//     },
// });

// export default memo(CommentActions);