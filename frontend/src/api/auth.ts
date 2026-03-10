/**
 * api/auth.ts
 * 
 * All functions that communicate with /auth endpoints.
 * 
 * login() - backend expects OAuth2 form encoding (not json), 
 *           use URLSearchParams to build form body.
 * 
 * signup() - backed uses Form() as well.
 */

import apiClient from "./client";
import type {
    LoginCredentials, 
    SignupCredentials, 
    Token, 
    User
} from "../types/models";

/**
 * POST /auth/login
 * Returns a JWT token. we store it in local storage after authenticating user.
 */
export async function login({ username, password }: LoginCredentials): Promise<Token> {
    const formData = new URLSearchParams();     // OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await apiClient.post<Token>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return data
}

/**
 * POST /auth/signup
 * Creates and returns a new user.
 */
export async function signup({ username, password }: SignupCredentials): Promise<User> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await apiClient.post<User>('/auth/signup', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return data;
}