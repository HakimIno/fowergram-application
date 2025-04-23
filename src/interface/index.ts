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

export interface Jwt {
    token: string;
}

export interface Credentials extends Jwt {
    user: UserDetails;
}