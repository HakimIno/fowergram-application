import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { FormInput, PasswordInput } from './index';
import { LoginFormValues, validateSingleField } from '../validation';
import styles from '../style';
import * as Haptics from 'expo-haptics';

interface LoginFormProps {
    formState: LoginFormValues;
    setFormState: React.Dispatch<React.SetStateAction<LoginFormValues>>;
    errors: {
        identifier?: string;
        password?: string;
        form?: string;
    };
    setErrors: React.Dispatch<React.SetStateAction<{
        identifier?: string;
        password?: string;
        form?: string;
    }>>;
    loginError?: string;
}

export const LoginForm = ({
    formState,
    setFormState,
    errors,
    setErrors,
    loginError
}: LoginFormProps) => {
    const [isEmail, setIsEmail] = useState(false);

    const handleChange = (field: keyof LoginFormValues) => (text: string) => {
        setFormState(prev => ({ ...prev, [field]: text }));
        
        if (field === 'identifier') {
            const emailPattern = /\S+@\S+\.\S+/;
            setIsEmail(emailPattern.test(text));
        }
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    
    const validateField = (field: keyof LoginFormValues) => async () => {
        try {
            const result = validateSingleField(field, formState);
            
            if (!result.success) {
                const fieldError = result.error.errors.find(err => err.path[0] === field);
                if (fieldError) {
                    setErrors(prev => ({ ...prev, [field]: fieldError.message }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            } else {
                setErrors(prev => ({ ...prev, [field]: undefined }));
            }
        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    return (
        <View style={styles.formContainer}>
            <FormInput 
                iconName={formState.identifier === '' ? "account-outline" : isEmail ? "email-outline" : "account-outline"}
                value={formState.identifier}
                onChangeText={handleChange('identifier')}
                onBlur={validateField('identifier')}
                error={errors.identifier}
                placeholder="ชื่อผู้ใช้หรืออีเมล"
                autoComplete="username"
                keyboardType={isEmail ? "email-address" : "default"}
                typeIndicator={formState.identifier !== '' ? (isEmail ? 'อีเมล' : 'ชื่อผู้ใช้') : undefined}
            />
            
            <PasswordInput 
                value={formState.password}
                onChangeText={handleChange('password')}
                onBlur={validateField('password')}
                error={errors.password}
            />
            
            {loginError ? (
                <Text style={[styles.errorText, styles.generalError]}>{loginError}</Text>
            ) : null}
        </View>
    );
}; 