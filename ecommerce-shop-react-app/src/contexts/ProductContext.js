import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { generateProductPlaceholder } from "../utils/placeholder";
import { useApp } from "./AppContext";

export const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  // products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { usePlaceholders } = useApp();

  // fetch products with search, filter, and pagination
  const fetchProducts = useCallback(async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (search) params.append('q', search);
      if (category) params.append('category', category);
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        const normalized = (data.items || []).map((p) => {
          const withId = { ...p, id: p._id };
          if (usePlaceholders) {
            return { ...withId, image: generateProductPlaceholder(withId) };
          }
          const absolute = withId.imageUrl?.startsWith('/')
            ? `http://localhost:5000${withId.imageUrl}`
            : withId.imageUrl;
          return { ...withId, image: absolute };
        });
        setProducts(normalized);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      } else {
        setError('Failed to load products');
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products from backend", err);
      setError('Network error. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [usePlaceholders]);

  // fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products/_meta/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  // initial load - only run once
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (isMounted) {
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
      }
    };
    
    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchProducts]); // run once on mount; fetchProducts is stable

  // search handler
  const handleSearch = useCallback((search) => {
    setSearchTerm(search);
    setCurrentPage(1);
    fetchProducts(1, search, selectedCategory);
  }, [fetchProducts, selectedCategory]);

  // category filter handler
  const handleCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchProducts(1, searchTerm, category);
  }, [fetchProducts, searchTerm]);

  // page change handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchProducts(page, searchTerm, selectedCategory);
  }, [fetchProducts, searchTerm, selectedCategory]);

  // retry handler
  const retry = useCallback(() => {
    fetchProducts(currentPage, searchTerm, selectedCategory);
  }, [fetchProducts, currentPage, searchTerm, selectedCategory]);

  return (
    <ProductContext.Provider 
      value={{ 
        products,
        categories,
        loading,
        error,
        currentPage,
        totalPages,
        totalProducts,
        searchTerm,
        selectedCategory,
        handleSearch,
        handleCategoryFilter,
        handlePageChange,
        retry
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;
