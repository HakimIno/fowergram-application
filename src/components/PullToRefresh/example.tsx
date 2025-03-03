import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PullToRefresh } from './';
import LottieView from 'lottie-react-native';

const CustomLottieIndicator = () => (
    <LottieView
        source={require('../../assets/lottie/pull.json')}
        style={{ width: 100, height: 100 }}
        autoPlay
        loop
    />
);

interface ItemData {
    id: number;
    color: string;
}

const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const PullToRefreshExample = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<ItemData[]>(
        Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            color: generateRandomColor()
        }))
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate new random items
        const newData = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            color: generateRandomColor()
        }));
        
        setData(newData);
        setRefreshing(false);
    };

    const handlePullProgress = (progress: number) => {
        console.log('Pull progress:', progress);
    };

    return (
        <PullToRefresh
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onPullProgress={handlePullProgress}
            customIndicator={<CustomLottieIndicator />}
            pullThreshold={150}
            indicatorColor="#5271ff"
        >
            <View style={styles.container}>
                {data.map((item) => (
                    <View 
                        key={item.id} 
                        style={[styles.item, { backgroundColor: item.color }]}
                    >
                        <Text style={[styles.itemText, { color: '#FFFFFF' }]}>
                            Item {item.id}
                        </Text>
                    </View>
                ))}
            </View>
        </PullToRefresh>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    item: {
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    itemText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 