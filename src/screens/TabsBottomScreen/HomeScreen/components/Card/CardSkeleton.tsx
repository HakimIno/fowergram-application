import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { Skeleton } from 'moti/skeleton'

const styles = StyleSheet.create({
    root: {
        borderRadius: 5,
    },
    headerContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderColor: "#e5e7eb",
        justifyContent: 'space-between'

    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 50,
        marginEnd: 8
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 5,
    },
    cardInfo: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    cardTitle: {
        fontWeight: 'bold',
    },
    cardLikes: {
        opacity: 0.35,
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export interface CardProps {
    image: string;
    title: string;
    likes: string;
}

const SkeletonCommonProps = {
    colorMode: "light",
    transition: {
        type: "timing",
        duration: 2000
    },
    backgroundColor: "#D4D4D4"
} as const;

const CardSkeleton: React.FC<CardProps & ViewProps> = ({
    style,
    image,
    title,
    likes,
    ...props
}) => {
    return (
        <View style={[styles.root, style]} {...props}>
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Skeleton show height={45} width={45} radius={"round"} {...SkeletonCommonProps} />
                    <View style={{ marginLeft: 5 }}>
                        <Skeleton
                            show
                            height={15}
                            width={100}
                            radius={"round"}
                            {...SkeletonCommonProps}
                        />
                        <View style={{ marginVertical: 5 }}>
                            <Skeleton
                                show
                                height={10}
                                width={50}
                                radius={"round"}
                                {...SkeletonCommonProps}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <Skeleton
                show
                height={300}
                width={'100%'}
                radius={5}
                {...SkeletonCommonProps}
            />
            <View style={styles.cardInfo}>
                <Skeleton
                    show
                    height={15}
                    width={200}
                    radius={"round"}
                    {...SkeletonCommonProps}
                />
                <Skeleton
                    show
                    height={10}
                    width={50}
                    radius={"round"}
                    {...SkeletonCommonProps}
                />
            </View>
        </View >
    );
};

export default CardSkeleton;