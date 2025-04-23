import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput } from './FormInput';
import styles from '../style';

interface PasswordInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
}

export const PasswordInput = ({
    value,
    onChangeText,
    onBlur,
    error,
    placeholder = 'รหัสผ่าน'
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <FormInput
            iconName="lock-outline"
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            error={error}
            placeholder={placeholder}
            secureTextEntry={!showPassword}
            rightComponent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable
                        style={[styles.passwordToggle, { right: 50 }]}
                        onPress={togglePasswordVisibility}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={error ? "#ef4444" : "#1a1a1a"}
                        />
                    </Pressable>
                    <Pressable
                        style={[styles.passwordToggle, { right: 10 }]}
                        onPress={() => {}}
                    >
                        <MaterialCommunityIcons name="lock-question" size={24} color="#1a1a1a" />
                    </Pressable>
                </View>
            }
        />
    );
}; 