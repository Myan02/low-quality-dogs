/**
 * api/dogs.ts
 * 
 * All functions that communicate with /dogs endpoints.
 */

import apiClient from "./client";
import type {
    Dog,
    DogListParams,
    DogCreateForm,
    DogEditForm
} from "../types/models";

/**
 * GET /dogs?offset=0&limit=20
 * Returns a paginated list of all dogs.
 */
export async function getAllDogs(params: DogListParams): Promise<Dog[]> {
    const { data } = await apiClient.get<Dog[]>('/dogs/', { params });
    return data;
}

/**
 * GET /dogs/name/:name
 * Returns all dogs with a matching name.
 */
export async function getDogsByName(name: string): Promise<Dog[]> {
    const { data } = await apiClient.get<Dog[]>(`/dogs/name/${name}`);
    return data;
}

/**
 * GET /dogs/id/:id
 * Returns the dog with the matching id.
 */
export async function getDogById(id: number): Promise<Dog> {
    const { data } = await apiClient.get<Dog>(`/dogs/id/${id}`);
    return data;
}

/**
 * POST /dogs
 * Uploads a new dog. Requires authentication.
 * Sends multipart/form-data since it requires a File upload.
 */
export async function uploadDog(form: DogCreateForm): Promise<Dog> {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('age', String(form.age));
    formData.append('description', form.description);
    formData.append('image', form.image);

    const { data } = await apiClient.post<Dog>('/dogs/', formData);
    return data;
}

/**
 * PATCH /dogs/:id
 * Edit a dog's data. Requires authentication.
 * Only sends fields that actually changed.
 */
export async function editDog(id: number, form: DogEditForm): Promise<Dog> {
    const formData = new FormData();
    if (form.name !== undefined) formData.append('name', form.name);
    if (form.age !== undefined) formData.append('age', String(form.age));
    if (form.image !== undefined) formData.append('image', form.image);

    const { data } = await apiClient.patch<Dog>(`/dogs/${id}`, formData);
    return data;
}

/**
 * DELETE /dogs/:id
 * Deletes a dog by id. Requires authentication.
 * Returns the deleted dog record.
 */
export async function deleteDog(id: number): Promise<Dog> {
    const { data } = await apiClient.delete<Dog>(`/dogs/${id}`);
    return data;
}