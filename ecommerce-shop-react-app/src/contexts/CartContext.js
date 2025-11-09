import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  // cart state
  const [cart, setCart] = useState([]);
  // item amount state
  const [itemAmount, setItemAmount] = useState(0);
  // total price state
  const [total, setTotal] = useState(0);
  // loading state
  const [loading, setLoading] = useState(false);
  
  const { token, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  // Load cart from backend when user logs in
  useEffect(() => {
    let isMounted = true;
    
    const handleAuthChange = async () => {
      if (isAuthenticated && token && isMounted) {
        await loadCart();
      } else if (isMounted) {
        // Clear cart when user logs out
        setCart([]);
        setItemAmount(0);
        setTotal(0);
      }
    };
    
    handleAuthChange();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  // Calculate totals when cart changes
  useEffect(() => {
    if (cart && cart.items) {
      const amount = cart.items.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.quantity;
      }, 0);
      setItemAmount(amount);
      setTotal(cart.subtotal || 0);
    }
  }, [cart]);

  // Load cart from backend
  const loadCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // add to cart
  const addToCart = async (product, id) => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          quantity: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        success(`${product.title} added to cart!`);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // remove from cart
  const removeFromCart = async (id) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        success('Item removed from cart');
      } else {
        showError('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
        success('Cart cleared successfully');
      } else {
        showError('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // increase amount
  const increaseAmount = async (id) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: (cart.items?.find(item => item.product === id)?.quantity || 0) + 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error increasing quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  // decrease amount
  const decreaseAmount = async (id) => {
    if (!isAuthenticated) return;

    const currentItem = cart.items?.find(item => item.product === id);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity - 1;

    if (newQuantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseAmount,
        decreaseAmount,
        itemAmount,
        total,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
