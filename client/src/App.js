import React, { useState, useEffect, useCallback } from 'react';
import RecipeSearch from './components/RecipeSearch';
import MealPlanner from './components/MealPlanner';
import * as api from './services/api'; // Import all functions from api.js
import './styles/main.css';

/**
 * Main application component for the Recipe & Meal Planner.
 * Manages global state for user favorites and meal plans,
 * handles data fetching and updates, and orchestrates child components.
 */
function App() {
  // State to store the user's favorite recipes
  const [favorites, setFavorites] = useState([]);
  // State to store the user's weekly meal plan
  // Structure: { day: { mealType: { id: string, title: string, imageUrl: string } | null } }
  const [mealPlan, setMealPlan] = useState({});
  // State to manage loading status during initial data fetch
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);
  // State to control which main view is currently active ('search' or 'planner')
  const [activeTab, setActiveTab] = useState('search');

  /**
   * Fetches initial user data (favorites and meal plan) from the backend.
   * Uses useCallback to memoize the function and prevent unnecessary re-renders.
   */
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Fetch favorites and meal plan concurrently
      const [favs, plan] = await Promise.all([
        api.getFavorites(),
        api.getMealPlan()
      ]);
      setFavorites(favs);
      setMealPlan(plan);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load your data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  /**
   * useEffect hook to call fetchInitialData when the component mounts.
   */
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]); // Dependency on fetchInitialData ensures it runs when the function changes (which it won't due to useCallback)

  /**
   * Handles adding a recipe to the user's favorites.
   * @param {Object} recipe - The recipe object to add.
   */
  const handleAddToFavorites = async (recipe) => {
    try {
      const newFavorite = await api.addFavorite(recipe);
      setFavorites((prevFavs) => [...prevFavs, newFavorite]);
    } catch (err) {
      console.error('Failed to add favorite:', err);
      setError