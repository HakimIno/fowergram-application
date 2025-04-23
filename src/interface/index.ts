export interface UserDetails {
    id: number;
    username: string;
    email: string;
    created_at?: string;
    firstName?: string;
    lastName?: string;
}

export interface NewUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginUser {
    identifier: string;
    password: string;
}

// API response format that may contain token in different places
export interface Jwt {
    code?: string;
    status?: string;
    message?: string;
    data?: {
        token: string;
        user: UserDetails;
        device_info?: any;
    };
    token?: string; // For backward compatibility
}

// Credentials that are actually stored must have token as a required string
export interface Credentials {
    token: string;
    user: UserDetails;
}