import axios from 'axios';

/**
 * @file client/src/services/api.js
 * @description Centralized service for making API calls to the Recipe & Meal Planner backend.
 *              This service abstracts away the HTTP request logic and provides
 *              convenient functions for interacting with various backend endpoints.
 *              It's designed to be easily swappable or extendable for different
 *              API versions or external services.
 */

// Determine the API base URL based on the environment.
// In a production environment, this would typically be the deployed backend URL.
// During development, it points to the local Node.js server.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create an Axios instance with a base URL and default headers.
// This allows for easier configuration and consistent request behavior.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Potentially add Authorization headers here if using JWTs or other auth tokens
    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
});

/**
 * Interceptor for handling responses.
 * This can be used for global error handling, logging, or token refreshing.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Log out user if 401 Unauthorized is received
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - perhaps token expired or invalid.');
      // Optionally, redirect to login page or refresh token
      // window.location.href = '/login';
    }
    console.error('API call failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Searches for recipes using the backend's proxied external recipe API.
 * @param {string} query - The search term for recipes.
 * @returns {Promise<Array>} A promise that resolves to an array of recipe results.
 */
export const searchRecipes = async (query) => {
  try {
    const response = await apiClient.get(`/recipes/search`, { params: { query } });
    return response.data;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error; // Re-throw to allow components to handle it
  }
};

/**
 * Fetches detailed information for a specific recipe.
 * @param {string} id - The unique identifier of the recipe.
 * @returns {Promise<Object>} A promise that resolves to the detailed recipe object.
 */
export const getRecipeDetails = async (id) => {
  try {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe details for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Saves a recipe to the user's favorites.
 * @param {Object} recipeData - The data of the recipe to save (e.g., id, title, image).
 * @returns {Promise<Object>} A promise that resolves to the saved favorite recipe object.
 */
export const saveFavoriteRecipe = async (recipeData) => {
  try {
    const response = await apiClient.post(`/favorites`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Error saving favorite recipe:', error);
    throw error;
  }
};

/**
 * Retrieves all favorite recipes for the current user.
 * @returns {Promise<Array>} A promise that resolves to an array of favorite recipe objects.
 */
export const getFavoriteRecipes = async () => {
  try {
    const response = await apiClient.get(`/favorites`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    throw error;
  }
};

/**
 * Removes a recipe from the user's favorites.
 * @param {string} favoriteId - The ID of the favorite entry to remove.
 * @returns {Promise<Object>} A promise that resolves to a confirmation object.
 */
export const removeFavoriteRecipe = async (favoriteId) => {
  try {
    const response = await apiClient.delete(`/favorites/${favoriteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing favorite recipe with ID ${favoriteId}:`, error);
    throw error;
  }
};

/**
 * Adds a recipe to the user's meal plan for a specific day and meal type.
 * @param {Object} mealPlanEntry - The meal plan entry data (e.g., recipeId, day, mealType).
 * @returns {Promise<Object>} A promise that resolves to the created meal plan entry.
 */
export const addRecipeToMealPlan = async (mealPlanEntry) => {
  try {
    const response = await apiClient.post(`/mealplan`, mealPlanEntry);
    return response.data;
  } catch (error) {
    console.error('Error adding recipe to meal plan:', error);
    throw error;
  }
};

/**
 * Retrieves the user's entire meal plan.
 * @returns {Promise<Array>} A promise that resolves to an array of meal plan entries.
 */
export const getMealPlan = async () => {
  try {
    const response = await apiClient.get(`/mealplan`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;
  }
};

/**
 * Removes a specific entry from the user's meal plan.
 * @param {string} mealPlanEntryId - The ID of the meal plan entry to remove.
 * @returns {Promise<Object>} A promise that resolves to a confirmation object.
 */
export const removeRecipeFromMealPlan = async (mealPlanEntryId) => {
  try {
    const response = await apiClient.delete(`/mealplan/${mealPlanEntryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing recipe from meal plan with ID ${mealPlanEntryId}:`, error);
    throw error;
  }
};

// Export the apiClient itself if direct access is needed for more complex scenarios
export default apiClient;