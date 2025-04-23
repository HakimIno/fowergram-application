import React from 'react';
import { View, TextInput, Text, ActivityIndicator, StyleProp, ViewStyle, TextInputProps, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../style';

interface FormInputProps extends TextInputProps {
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    error?: string;
    loading?: boolean;
    isValid?: boolean;
    showValidIcon?: boolean;
    iconStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    iconColor?: string;
    errorColor?: string;
    successColor?: string;
    inputStyle?: StyleProp<TextStyle>;
    rightComponent?: React.ReactNode;
}

/**
 * Custom input component for forms with validation state
 */
export const FormInput = ({
    iconName,
    error,
    loading,
    isValid,
    showValidIcon = true,
    iconStyle,
    containerStyle,
    iconColor = "#6b7280",
    errorColor = "#ef4444",
    successColor = "#10b981",
    inputStyle,
    rightComponent,
    ...props
}: FormInputProps) => {
    return (
        <>
            <View style={[
                styles.inputWrapper,
                error ? styles.inputWrapperError : null,
                containerStyle
            ]}>
                <MaterialCommunityIcons
                    name={iconName}
                    size={20}
                    color={error ? errorColor : iconColor}
                    style={[styles.inputIcon, iconStyle as any]}
                />
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            backgroundColor: error 
                                ? "rgba(255, 209, 209, 0.5)" 
                                : "rgba(229, 231, 235, 0.5)" 
                        },
                        inputStyle
                    ]}
                    placeholderTextColor={'#a1a1aa'}
                    autoCapitalize="none"
                    {...props}
                />
                
                {loading && (
                    <ActivityIndicator 
                        size="small" 
                        color={iconColor} 
                        style={styles.inputStatusIcon} 
                    />
                )}
                
                {isValid && !loading && showValidIcon && (
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color={successColor}
                        style={styles.inputStatusIcon}
                    />
                )}
                
                {rightComponent}
            </View>
            
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </>
    );
}; 