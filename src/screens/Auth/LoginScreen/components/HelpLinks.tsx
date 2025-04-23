import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styles from '../style';
import { LoginNavigationProp } from '..';

interface HelpLinksProps {
    navigation: LoginNavigationProp;
}

export const HelpLinks = ({ navigation }: HelpLinksProps) => {
    return (
        <View style={styles.helpLinksContainer}>
            <Pressable onPress={() => navigation.navigate("register_screen")}>
                <Text style={styles.helpLinkText}>ยังไม่มีบัญชีใช่ไหม?</Text>
            </Pressable>

            <Pressable>
                <Text style={[styles.helpLinkText, { color: "#4f46e5" }]}>ลืมรหัสผ่านเหรอ?</Text>
            </Pressable>
        </View>
    );
}; 