/**
 * obfuscate.ts
 * Utility for simple ID obfuscation/deobfuscation
 * Used primarily for QR codes and URLs to prevent direct manipulation of IDs
 */

import config from "../config";

/**
 * Salt value used for obfuscation
 * Pulled from environment variables or defaults to 'secret'
 */
const secret = config.QR_SALT || 'secret';

/**
 * Encodes an ID by prepending a secret salt and base64 encoding
 * Used to obfuscate table IDs in QR codes and URLs
 * 
 * @param {number|string} id - The ID to encode
 * @returns {string} Base64 encoded string
 */
export const encodeId = (id: number | string) => {
    return btoa(secret + id);
};

/**
 * Decodes an obfuscated ID by base64 decoding and removing the secret salt
 * 
 * @param {string} encoded - The encoded ID string to decode
 * @returns {string} The original ID as a string
 */
export const decodeId = (encoded: string): string => {
    const decoded = atob(encoded);
    return decoded.replace(secret, '');
};
