// ----- AUTHENTICATION -----

/**
 * Data we send to /auth/login
 * Backend expects OAuth2 form data (username + password)
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * What we send to /auth/signup
 */
export interface SignupCredentials {
    username: string;
    password: string;
}

/**
 * What /auth/login returns 
 */
export interface Token {
    access_token: string;
    token_type: string;
}

/**
 * What the backend stores and returns for a user
 */
export interface User {
    id: number;
    is_active: boolean;
    is_superuser: boolean;
    hashed_password: string;
    created_at: string;
}

// ----- DOG TYPES -----

/**
 * A dog record returned by the backend api
 */
export interface Dog {
    id: number;
    name: string;
    age: number;
    description: string;
    image_url: string | null;
    owner_id: number;
    owner_username: string;
    created_at: string;
}

/**
 * Pagination parameters for GET /dogs
 */
export interface DogListParams {
    offset: number;     // page number 
    limit: number;
}

/**
 * Schema when uploading a new dog (POST /dogs)
 */
export interface DogCreateForm {
    name: string;
    age: number;
    description: string;
    image: File;
}

/**
 * Schema when editing an existing dog (PATCH /dogs/:id)
 * All fields are optional 
 */
export interface DogEditForm {
    name?: string;
    age?: number;
    image?: File;
}

// ----- API ERROR -----

/**
 * FastAPI returns { detail: string} on HTTPExceptions
 */
export interface ApiError {
    detail: string;
}