/**
 * All functions that communicate with /auth endpoints.
 * 
 * login() - backend expects OAuth2 form encoding (not json), 
 *           use URLSearchParams to build form body.
 * 
 * signup() - backed uses Form() fields as well.
 */

import apiClient from "./client";
import type {
    LoginCredentials, 
    SignupCredentials, 
    Token, 
    User,
    UserListParams
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

    return data;
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

/**
 * GET /auth/?limit=10&offset=0
 * Fetches all users
 */
export async function getAllUsers(params: UserListParams): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/auth/', { params });
    return data;
}

/**
 * GET /auth/:username
 * Fetches all users with the username = :username
 */
export async function getUsersByUsername(username: string): Promise<User[]> {
    const { data } = await apiClient.get<User[]>(`/auth/${username}`);
    return data;
}

/**
 * DELETE /auth/:user_id
 * Deletes a user with the given id
 */
export async function deleteUser(user_id?: number): Promise<User> {
    const { data } = await apiClient.delete<User>(`/auth/${user_id}`);
    return data;
}