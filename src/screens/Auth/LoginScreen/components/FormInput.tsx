import React from 'react';
import { View, TextInput, Text, StyleProp, ViewStyle, TextInputProps, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../style';

interface FormInputProps extends TextInputProps {
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
    error?: string;
    iconStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    iconColor?: string;
    errorColor?: string;
    inputStyle?: StyleProp<TextStyle>;
    rightComponent?: React.ReactNode;
    typeIndicator?: string;
}

export const FormInput = ({
    iconName,
    error,
    iconStyle,
    containerStyle,
    iconColor = "#6b7280",
    errorColor = "#ef4444",
    inputStyle,
    rightComponent,
    typeIndicator,
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
                    style={[styles.inputIcon, iconStyle]}
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
                
                {typeIndicator && (
                    <View style={styles.inputTypeIndicator}>
                        <Text style={styles.inputTypeText}>
                            {typeIndicator}
                        </Text>
                    </View>
                )}
                
                {rightComponent}
            </View>
            
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </>
    );
}; 