/**
 * API Configuration
 * Uses environment variables for different environments
 */

// Get API base URL from environment variable or fallback to localhost
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

// Ensure the API base URL doesn't end with a slash
const cleanApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

// Export for use in other files
export default cleanApiBase;