import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StrokeStyleType } from '../../types';

const StrokeStylePreview = React.memo(({ style }: { style: StrokeStyleType }) => {
    switch (style) {
        case 'solid':
            return <View style={styles.stylePreviewContainer}><View style={[styles.stylePreview, { backgroundColor: '#fff' }]} /></View>;

        case 'dashed':
            return (
                <View style={styles.stylePreviewContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={`dash-${i}`}
                            style={[
                                styles.dashLine,
                                {
                                    width: 8,
                                    marginRight: 4,
                                    backgroundColor: '#fff'
                                }
                            ]}
                        />
                    ))}
                </View>
            );

        case 'dotted':
            return (
                <View style={styles.stylePreviewContainer}>
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <View
                            key={`dot-${i}`}
                            style={[
                                styles.dotPoint,
                                {
                                    width: 3,
                                    height: 3,
                                    borderRadius: 1.5,
                                    marginRight: 4,
                                    backgroundColor: '#fff'
                                }
                            ]}
                        />
                    ))}
                </View>
            );

        case 'heart':
            return (
                <View style={styles.stylePreviewContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <MaterialCommunityIcons
                            key={`heart-${i}`}
                            name="heart"
                            size={10}
                            color="#fff"
                            style={{ marginRight: 3 }}
                        />
                    ))}
                </View>
            );

        case 'flower':
            return (
                <View style={styles.stylePreviewContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <Ionicons
                            key={`flower-${i}`}
                            name="flower-outline"
                            size={10}
                            color="#fff"
                            style={{ marginRight: 3 }} />
                    ))}
                </View>
            );

        case 'star':
            return (
                <View style={styles.stylePreviewContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <MaterialCommunityIcons
                            key={`star-${i}`}
                            name="star"
                            size={10}
                            color="#fff"
                            style={{ marginRight: 3 }}
                        />
                    ))}
                </View>
            );
    }
});

const styles = StyleSheet.create({
    stylePreview: {
        width: '100%',
        height: 3,
        marginBottom: 8,
        borderRadius: 3,

    },
    stylePreviewContainer: {
        width: 48,
        height: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dashLine: {
        height: 3,
        borderRadius: 2,
    },
    dotPoint: {
        borderRadius: 1.5,
    },
});

export default StrokeStylePreview; 