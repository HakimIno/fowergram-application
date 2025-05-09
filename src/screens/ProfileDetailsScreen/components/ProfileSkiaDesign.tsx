import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
    Canvas,
    Circle,
    Group,
    LinearGradient,
    vec,
    Image,
    useImage,
    RoundedRect,
    Text,
    useFont,
    Fill,
} from "@shopify/react-native-skia";
import { FORNTS } from 'src/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROFILE_HEIGHT = 350;
const AVATAR_SIZE = 120;

type ProfileSkiaProps = {
    imageUrl: string;
    username: string;
    stats: {
        posts: number;
        followers: number;
        following: number;
    };
    bio: string;
}

const ProfileSkiaDesign: React.FC<ProfileSkiaProps> = ({
    imageUrl,
    username,
    stats,
    bio
}) => {
    const profileImage = useImage(imageUrl);
    const font = useFont(FORNTS.Chirp_Bold, 14);
    const headerFont = useFont(FORNTS.Chirp_Bold, 18);

    if (!font || !headerFont || !profileImage) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Canvas style={styles.canvas}>
                {/* Background Gradient */}
                <Fill>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(SCREEN_WIDTH, PROFILE_HEIGHT)}
                        colors={["#ffffff", "#f3f4f6"]}
                    />
                </Fill>

                {/* Profile Card Background */}
                <Group transform={[{ translateY: 20 }]}>
                    <RoundedRect
                        x={16}
                        y={0}
                        width={SCREEN_WIDTH - 32}
                        height={PROFILE_HEIGHT - 40}
                        r={12}
                        color="white"
                    />
                    <RoundedRect
                        x={16}
                        y={0}
                        width={SCREEN_WIDTH - 32}
                        height={PROFILE_HEIGHT - 40}
                        r={12}
                        style="stroke"
                        strokeWidth={1}
                        color="#e5e7eb"
                    />
                </Group>

                {/* Profile Image with Circle Border */}
                <Group transform={[{ translateX: (SCREEN_WIDTH - AVATAR_SIZE) / 2, translateY: 40 }]}>
                    <Circle
                        cx={AVATAR_SIZE / 2}
                        cy={AVATAR_SIZE / 2}
                        r={(AVATAR_SIZE + 4) / 2}
                        color="#84cc16"
                    />
                    <Circle
                        cx={AVATAR_SIZE / 2}
                        cy={AVATAR_SIZE / 2}
                        r={AVATAR_SIZE / 2}
                        color="white"
                    />
                    <Group
                        clip={
                            <Circle cx={AVATAR_SIZE / 2} cy={AVATAR_SIZE / 2} r={AVATAR_SIZE / 2} />
                        }
                    >
                        <Image
                            image={profileImage}
                            x={0}
                            y={0}
                            width={AVATAR_SIZE}
                            height={AVATAR_SIZE}
                            fit="cover"
                        />
                    </Group>
                </Group>

                {/* Username */}
                <Text
                    x={SCREEN_WIDTH / 2 - 50} // Adjust x position for center alignment
                    y={AVATAR_SIZE + 80}
                    text={username}
                    font={headerFont}
                    color="#1a1a1a"
                />

                {/* Stats */}
                <Group transform={[{ translateY: AVATAR_SIZE + 100 }]}>
                    <StatsSection
                        x={SCREEN_WIDTH / 4}
                        label="Posts"
                        value={stats.posts}
                        font={font}
                    />
                    <StatsSection
                        x={SCREEN_WIDTH / 2}
                        label="Followers"
                        value={stats.followers}
                        font={font}
                    />
                    <StatsSection
                        x={(SCREEN_WIDTH / 4) * 3}
                        label="Following"
                        value={stats.following}
                        font={font}
                    />
                </Group>

                {/* Bio - Split into multiple lines if needed */}
                {bio.split('\n').map((line, index) => (
                    <Text
                        key={index}
                        x={32}
                        y={AVATAR_SIZE + 160 + (index * 20)} // Add spacing between lines
                        text={line}
                        font={font}
                        color="#4b5563"
                    />
                ))}
            </Canvas>
        </View>
    );
};

type StatsSectionProps = {
    x: number;
    label: string;
    value: number;
    font: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ x, label, value, font }) => {
    return (
        <Group transform={[{ translateX: x - 30 }]}>
            <Text
                x={0}
                y={0}
                text={value.toString()}
                font={font}
                color="#1a1a1a"
            />
            <Text
                x={0}
                y={20}
                text={label}
                font={font}
                color="#6b7280"
            />
        </Group>
    );
};

const styles = StyleSheet.create({
    container: {
        height: PROFILE_HEIGHT,
        width: SCREEN_WIDTH,
    },
    canvas: {
        flex: 1,
    },
});

export default ProfileSkiaDesign;