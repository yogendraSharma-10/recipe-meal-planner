import React, { useState, useCallback } from 'react';
import { searchRecipes, saveFavoriteRecipe } from '../services/api'; // Assuming these functions are exported from api.js
import '../styles/main.css'; // Import main styles

/**
 * @typedef {object} Recipe
 * @property {string} id - Unique identifier for the recipe.
 * @property {string} title - The name of the recipe.
 * @property {string} image - URL to the recipe's image.
 * @property {string} sourceUrl - URL to the original recipe source.
 * @property {Array<string>} ingredients - List of ingredients.
 * @property {Array<string>} instructions - List of instructions.
 */

/**
 * RecipeSearch Component
 *
 * Allows users to search for recipes using an external API,
 * displays the results, and provides functionality to save
 * favorite recipes to the user's collection.
 */
function RecipeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  /** @type {Array<Recipe>} */
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favoriteStatus, setFavoriteStatus] = useState({}); // To track if a recipe has been favorited

  /**
   * Handles the change event for the search input field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object.
   */
  const handleSearchInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  /**
   * Initiates a recipe search based on the current searchQuery.
   * Fetches data from the external API via the local API service.
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    setFavoriteStatus({}); // Clear favorite status for new search

    try {
      const data = await searchRecipes(searchQuery);
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setError('No recipes found for your query. Try something else!');
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError('Failed to fetch recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  /**
   * Saves a selected recipe as a favorite.
   * @param {Recipe} recipe - The recipe object to be favorited.
   */
  const handleFavoriteRecipe = useCallback(async (recipe) => {
    // Prevent multiple clicks while saving
    if (favoriteStatus[recipe.id] === 'saving' || favoriteStatus[recipe.id] === 'saved') {
      return;
    }

    setFavoriteStatus(prev => ({ ...prev, [recipe.id]: 'saving' }));
    try {
      // The API service should handle sending the necessary recipe data to the backend.
      // The backend will then store it in the user's favorites.
      await saveFavoriteRecipe(recipe);
      setFavoriteStatus(prev => ({ ...prev, [recipe.id]: 'saved' }));
      // Optionally, provide user feedback like a toast notification
      console.log(`Recipe "${recipe.title}" saved to favorites!`);
    } catch (err) {
      console.error('Failed to save favorite recipe:', err);
      setFavoriteStatus(prev => ({ ...prev, [recipe.id]: 'error' }));
      setError(`Failed to save "${recipe.title}" to favorites. Please try again.`);
    }
  }, [favoriteStatus]);

  return (
    <section className="recipe-search-section">
      <h2 className="section-title">Find New Recipes</h2>

      <div className="search-input-group">
        <input
          type="text"
          className="search-input"
          placeholder="e.g., chicken pasta, vegan curry"
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          aria-label="Search for recipes"
        />
        <button
          className="btn btn-primary search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading && <p className="loading-message">Loading recipes...</p>}

      <div className="recipe-results-grid">
        {searchResults.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img
              src={recipe.image || 'https://via.placeholder.com/150?text=No+Image'}
              alt={recipe.title}
              className="recipe-card-image"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} // Fallback for broken images
            />
            <h3 className="recipe-card-title">{recipe.title}</h3>
            <div className="recipe-card-actions">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-small"
                aria-label={`View full recipe for ${recipe.title}`}
              >
                View Recipe
              </a>
              <button
                className={`btn btn-favorite btn-small ${favoriteStatus[recipe.id] === 'saved' ? 'btn-favorited' : ''}`}
                onClick={() => handleFavoriteRecipe(recipe)}
                disabled={favoriteStatus[recipe.id] === 'saving' || favoriteStatus[recipe.id] === 'saved'}
                aria-label={favoriteStatus[recipe.id] === 'saved' ? 'Recipe favorited' : 'Favorite this recipe'}
              >
                {favoriteStatus[recipe.id] === 'saving' ? 'Saving...' :
                 favoriteStatus[recipe.id] === 'saved' ? 'Favorited!' : 'Favorite'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecipeSearch;