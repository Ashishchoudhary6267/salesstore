import React, { useState, useEffect } from 'react';
import { BsSearch, BsFilter } from 'react-icons/bs';

const SearchAndFilters = ({ onSearch, onCategoryFilter, categories = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onCategoryFilter(category);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    onSearch('');
    onCategoryFilter('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BsSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
        >
          <BsFilter className="h-4 w-4" />
          Filters
        </button>
        
        {(searchTerm || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
