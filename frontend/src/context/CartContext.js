import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setToastMessage(`${product.name} added to cart! 🛒`);
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return (state.items || []).reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return (state.items || []).reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      cart: state.items, // alias for backward compatibility
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount,
      isCartOpen,
      setIsCartOpen,
      toastMessage,
      setToastMessage
    }}>
      {children}
      
      {/* Toast Notification - Bottom Right */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            fontWeight: '600',
            fontSize: '15px',
            maxWidth: '300px',
            animation: 'slideInFromRight 0.4s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>✅</span>
          {toastMessage}
        </div>
      )}
      
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};