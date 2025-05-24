import request from "./apiService";
import { Role, User, UserRegistrationRequest, UserUpdateRequest } from "../types";

/**
 * Fetches all users from the API
 * @returns Promise resolving to an array of users
 */
export const getAllUsers = async (): Promise<User[]> => {
    return await request<User[]>('/users');
};

/**
 * Fetches a user by their ID
 * @param id The user's ID
 * @returns Promise resolving to the user
 */
export const getUserById = async (id: string): Promise<User> => {
    return await request<User>(`/users/${id}`);
};

/**
 * Creates a new user
 * @param userData The user data
 * @param role The role to assign to the user
 * @returns Promise resolving to the created user
 */
export const createUser = async (userData: UserRegistrationRequest, role: Role): Promise<User> => {
    return await request<User>(`/users?role=${role}`, 'POST', userData);
};

/**
 * Updates an existing user
 * @param id The user's ID
 * @param userData The updated user data
 * @returns Promise resolving to the updated user
 */
export const updateUser = async (id: string, userData: UserUpdateRequest): Promise<User> => {
    return await request<User>(`/users/${id}`, 'PUT', userData);
};

/**
 * Deletes a user
 * @param id The user's ID
 * @returns Promise resolving to void
 */
export const deleteUser = async (id: string): Promise<void> => {
    return await request<void>(`/users/${id}`, 'DELETE');
};
