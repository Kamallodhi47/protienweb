import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('protein_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Bowl Builder Live Engine State
  const [customBowl, setCustomBowl] = useState({
    name: 'Custom High-Protein Bowl',
    selectedIngredients: []
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('protein_cart', JSON.stringify(cart));
  }, [cart]);

  // Live Nutrition Calculation Engine
  const bowlMacros = customBowl.selectedIngredients.reduce(
    (acc, ing) => {
      acc.protein += Number(ing.protein || 0);
      acc.calories += Number(ing.calories || 0);
      acc.carbs += Number(ing.carbs || 0);
      acc.fat += Number(ing.fat || 0);
      acc.weight += Number(ing.weight || 50);
      return acc;
    },
    { protein: 0, calories: 0, carbs: 0, fat: 0, weight: 0, price: 99 } // Fixed custom bowl price = 99
  );

  const isSeasoningItem = (ing) =>
    ing.category === 'SEASONINGS' ||
    ing.category?.slug === 'seasonings' ||
    ing.name?.toLowerCase().includes('nimbu') ||
    ing.name?.toLowerCase().includes('masala') ||
    ing.name?.toLowerCase().includes('pudina') ||
    ing.name?.toLowerCase().includes('lemon') ||
    ing.name?.toLowerCase().includes('mint');

  const toggleIngredientInBowl = (ingredient) => {
    setCustomBowl((prev) => {
      const exists = prev.selectedIngredients.some((i) => i.id === ingredient.id);
      if (exists) {
        return {
          ...prev,
          selectedIngredients: prev.selectedIngredients.filter((i) => i.id !== ingredient.id)
        };
      } else {
        const isSeasoning = isSeasoningItem(ingredient);
        const mainCount = prev.selectedIngredients.filter((i) => !isSeasoningItem(i)).length;

        if (!isSeasoning && mainCount >= 6) {
          addToast('You can select a maximum of 6 main ingredients per bowl. (Seasonings/Add-ons do not count towards this limit).', 'error');
          return prev;
        }
        return {
          ...prev,
          selectedIngredients: [...prev.selectedIngredients, ingredient]
        };
      }
    });
  };

  const clearCustomBowl = () => {
    setCustomBowl({
      name: 'Custom High-Protein Bowl',
      selectedIngredients: []
    });
  };

  const addCustomBowlToCart = (customName) => {
    if (customBowl.selectedIngredients.length === 0) {
      addToast('Please select at least 1 ingredient for your custom bowl.', 'error');
      return;
    }

    const displayName = customName || customBowl.name;

    const item = {
      id: `custom-${Date.now()}`,
      name: displayName,
      itemType: 'CUSTOM_BOWL',
      price: bowlMacros.price,
      protein: bowlMacros.protein,
      calories: bowlMacros.calories,
      carbs: bowlMacros.carbs,
      fat: bowlMacros.fat,
      quantity: 1,
      ingredientDetails: customBowl.selectedIngredients
    };

    setCart((prev) => [...prev, item]);
    addToast(`${displayName} added to cart!`, 'success');
    clearCustomBowl();
  };

  const addCustomItemToCart = (item) => {
    setCart((prev) => [...prev, item]);
    addToast(`${item.name} added to cart!`, 'success');
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id && i.itemType !== 'CUSTOM_BOWL');
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          itemType: product.category === 'JUICE' ? 'JUICE' : 'PRESET',
          price: product.price,
          protein: product.protein || 0,
          calories: product.calories || 0,
          carbs: product.carbs || 0,
          fat: product.fat || 0,
          quantity: 1,
          image: product.image
        }
      ];
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    addToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart summary calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalProtein = cart.reduce((sum, item) => sum + item.protein * item.quantity, 0);
  const totalCalories = cart.reduce((sum, item) => sum + item.calories * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        customBowl,
        bowlMacros,
        toggleIngredientInBowl,
        clearCustomBowl,
        addCustomBowlToCart,
        addCustomItemToCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalProtein,
        totalCalories
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
