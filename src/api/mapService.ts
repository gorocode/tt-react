/**
 * mapService.ts
 * Service for handling restaurant map-related API requests
 */

// Types
import { MapType } from "../types";

// API utilities
import request from "./apiService";

/**
 * Retrieves all available restaurant maps
 * 
 * @returns {Promise<MapType[]>} Array of all maps in the system
 */
export const getAllMaps = async (): Promise<MapType[]> => {
    return await request('/map');
};

/**
 * Retrieves a specific restaurant map by its ID
 * 
 * @param {number} mapId - The ID of the map to retrieve
 * @returns {Promise<MapType>} The requested map data
 */
export const getMapById = async (mapId: number): Promise<MapType> => {
    const endpoint = `/map/${mapId}`;
    return await request(endpoint);
};

/**
 * Updates an existing restaurant map
 * 
 * @param {MapType} map - The map data to update (must include ID)
 * @returns {Promise<MapType>} The updated map from the server
 */
export const putMap = async (map: MapType): Promise<MapType> => {
    return await request('/map', 'PUT', map);
};

/**
 * Creates a new restaurant map
 * 
 * @param {string} mapName - The name for the new map
 * @returns {Promise<MapType>} The created map with server-generated ID
 */
export const createMap = async (mapName: string): Promise<MapType> => {
    return await request(`/map?name=${mapName}`, 'POST');
}

/**
 * Deletes a restaurant map by its ID
 * 
 * @param {number} mapId - The ID of the map to delete
 * @returns {Promise<Object>} Response indicating deletion success
 */
export const deleteMap = async (mapId: number): Promise<Object> => {
    return await request(`/map/${mapId}`, 'DELETE');
};