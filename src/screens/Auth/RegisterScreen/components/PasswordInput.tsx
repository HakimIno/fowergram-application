import React, { useState } from 'react';
import { Pressable } from 'react-native';
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

/**
 * Password input component with toggle visibility button
 */
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
                <Pressable
                    style={styles.passwordToggle}
                    onPress={togglePasswordVisibility}
                >
                    <MaterialCommunityIcons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color={error ? "#ef4444" : "#6b7280"}
                    />
                </Pressable>
            }
        />
    );
}; 