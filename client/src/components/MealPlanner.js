import React, { useState, useEffect, useCallback } from 'react';
import { getMealPlan, updateMealPlan, getFavoriteRecipes } from '../services/api'; // Assuming these API calls exist
import '../styles/main.css'; // Import main styles

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

function MealPlanner() {
  const [mealPlan, setMealPlan] = useState({});
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize meal plan structure if empty
  const initializeMealPlan = useCallback(() => {
    const initialPlan = {};
    daysOfWeek.forEach(day => {
      initialPlan[day] = {};
      mealTypes.forEach(type => {
        initialPlan[day][type.toLowerCase()] = null;
      });
    });
    return initialPlan;
  }, []);

  // Fetch meal plan and favorite recipes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [planResponse, favoritesResponse] = await Promise.all([
          getMealPlan(),
          getFavoriteRecipes()
        ]);

        // Merge fetched plan with initial structure to ensure all days/meal types exist
        const fetchedPlan = planResponse.data || {};
        const mergedPlan = initializeMealPlan();
        daysOfWeek.forEach(day => {
          mealTypes.forEach(type => {
            const mealKey = type.toLowerCase();
            if (fetchedPlan[day] && fetchedPlan[day][mealKey]) {
              mergedPlan[day][mealKey] = fetchedPlan[day][mealKey];
            }
          });
        });
        setMealPlan(mergedPlan);
        setFavoriteRecipes(favoritesResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch meal plan or favorites:', err);
        setError('Failed to load meal plan or favorite recipes. Please try again.');
        setMealPlan(initializeMealPlan()); // Initialize with empty plan on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initializeMealPlan]);

  // Function to save the meal plan to the backend
  const saveCurrentMealPlan = useCallback(async (updatedPlan) => {
    setSaving(true);
    try {
      await updateMealPlan(updatedPlan);
      // Optionally, show a success message
    } catch (err) {
      console.error('Failed to save meal plan:', err);
      setError('Failed to save meal plan. Please try again.');
    } finally {
      setSaving(false);
    }
  }, []);

  // Handle drag start for a favorite recipe
  const handleDragStart = (e, recipe) => {
    e.dataTransfer.setData('application/json', JSON.stringify(recipe));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over a meal slot
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle dropping a recipe into a meal slot
  const handleDrop = (e, day, mealType) => {
    e.preventDefault();
    try {
      const recipeData = JSON.parse(e.dataTransfer.getData('application/json'));
      const updatedMealPlan = { ...mealPlan };
      updatedMealPlan[day][mealType.toLowerCase()] = recipeData;
      setMealPlan(updatedMealPlan);
      saveCurrentMealPlan(updatedMealPlan); // Persist changes
    } catch (err) {
      console.error('Error parsing dropped data:', err);
      setError('Invalid recipe data dropped.');
    }
  };

  // Handle removing a recipe from a meal slot
  const handleRemoveRecipe = (day, mealType) => {
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[day][mealType.toLowerCase()] = null;
    setMealPlan(updatedMealPlan);
    saveCurrentMealPlan(updatedMealPlan); // Persist changes
  };

  if (loading) {
    return <div className="meal-planner-container loading">Loading meal plan...</div>;
  }

  if (error) {
    return <div className="meal-planner-container error">Error: {error}</div>;
  }

  return (
    <div className="meal-planner-container">
      <h2 className="meal-planner-title">Weekly Meal Planner</h2>
      {saving && <div className="saving-indicator">Saving meal plan...</div>}

      <div className="meal-planner-content">
        {/* Favorite Recipes Section */}
        <div className="favorite-recipes-sidebar">
          <h3>Your Favorite Recipes</h3>
          {favoriteRecipes.length === 0 ? (
            <p>No favorite recipes yet. Search and save some!</p>
          ) : (
            <div className="favorite-recipes-list">
              {favoriteRecipes.map(recipe => (
                <div
                  key={recipe._id || recipe.id} // Use _id for MongoDB, id for external API
                  className="favorite-recipe-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe)}
                >
                  {recipe.image && <img src={recipe.image} alt={recipe.title} className="recipe-thumbnail" />}
                  <span className="recipe-title">{recipe.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meal Plan Grid */}
        <div className="meal-plan-grid">
          <div className="grid-header">
            <div className="grid-cell empty-cell"></div> {/* Top-left empty corner */}
            {mealTypes.map(type => (
              <div key={type} className="grid-cell meal-type-header">
                {type}
              </div>
            ))}
          </div>

          {daysOfWeek.map(day => (
            <div key={day} className="grid-row">
              <div className="grid-cell day-header">{day}</div>
              {mealTypes.map(type => {
                const mealKey = type.toLowerCase();
                const assignedRecipe = mealPlan[day]?.[mealKey];
                return (
                  <div
                    key={`${day}-${mealKey}`}
                    className="grid-cell meal-slot"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, type)}
                  >
                    {assignedRecipe ? (
                      <div className="assigned-recipe">
                        {assignedRecipe.image && <img src={assignedRecipe.image} alt={assignedRecipe.title} className="recipe-thumbnail" />}
                        <span className="recipe-title">{assignedRecipe.title}</span>
                        <button
                          className="remove-recipe-btn"
                          onClick={() => handleRemoveRecipe(day, type)}
                          aria-label={`Remove ${assignedRecipe.title} from ${day} ${type}`}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <span className="placeholder-text">Drag & Drop Recipe Here</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealPlanner;