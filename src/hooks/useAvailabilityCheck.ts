import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { httpEndpoint } from 'src/util/http';

// Function to check username availability
export const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return null;
    
    const response = await httpEndpoint.get(`/api/v1/users/check/username?username=${encodeURIComponent(username)}`);
    return response.data;
};

// Function to check email availability
export const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return null;
    
    const response = await httpEndpoint.get(`/api/v1/users/check/email?email=${encodeURIComponent(email)}`);
    return response.data;
};

interface UseAvailabilityCheckResult {
    usernameAvailable: boolean | undefined;
    usernameLoading: boolean;
    usernameError: boolean;
    emailAvailable: boolean | undefined;
    emailLoading: boolean;
    emailError: boolean;
}

/**
 * Custom hook for checking availability of username and email in real-time
 * @param username - The username to check
 * @param email - The email to check
 * @returns Object containing availability status, loading state, and error state for both username and email
 */
export const useAvailabilityCheck = (username: string, email: string): UseAvailabilityCheckResult => {
    // Keep track of the values for validation
    const [usernameToCheck, setUsernameToCheck] = useState("");
    const [emailToCheck, setEmailToCheck] = useState("");
    
    // Define debounced setters
    const debouncedSetUsername = useDebouncedCallback(
        (value: string) => setUsernameToCheck(value),
        500
    );
    
    const debouncedSetEmail = useDebouncedCallback(
        (value: string) => setEmailToCheck(value),
        500
    );
    
    // Update debounced values
    useEffect(() => {
        if (username.length >= 3) {
            debouncedSetUsername(username);
        }
    }, [username, debouncedSetUsername]);
    
    useEffect(() => {
        if (email.includes('@')) {
            debouncedSetEmail(email);
        }
    }, [email, debouncedSetEmail]);
    
    // Query for username availability
    const usernameQuery = useQuery({
        queryKey: ['checkUsername', usernameToCheck],
        queryFn: () => checkUsernameAvailability(usernameToCheck),
        enabled: usernameToCheck.length >= 3,
        refetchOnWindowFocus: false,
        staleTime: 30000, // Consider results stale after 30 seconds
    });
    
    // Query for email availability
    const emailQuery = useQuery({
        queryKey: ['checkEmail', emailToCheck],
        queryFn: () => checkEmailAvailability(emailToCheck),
        enabled: emailToCheck.includes('@'),
        refetchOnWindowFocus: false,
        staleTime: 30000, // Consider results stale after 30 seconds
    });
    
    return {
        usernameAvailable: usernameQuery.data?.available,
        usernameLoading: usernameQuery.isPending,
        usernameError: usernameQuery.isError,
        
        emailAvailable: emailQuery.data?.available,
        emailLoading: emailQuery.isPending,
        emailError: emailQuery.isError,
    };
}; 