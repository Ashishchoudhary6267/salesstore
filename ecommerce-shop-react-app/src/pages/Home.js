import React, { useContext, useMemo } from "react";
import { ProductContext } from "../contexts/ProductContext";
import Product from '../components/Product'
import Hero from '../components/Hero'
import SearchAndFilters from '../components/SearchAndFilters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Pagination from '../components/Pagination'

const Home = () => {
  const { 
    products, 
    categories, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalProducts,
    handleSearch,
    handleCategoryFilter,
    handlePageChange,
    retry
  } = useContext(ProductContext);

  // Memoize the products grid to prevent unnecessary re-renders
  const productsGrid = useMemo(() => {
    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <Product product={product} key={product.id} />
        ))}
      </div>
    );
  }, [products]);

  return (
    <div>
      <Hero />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-10 text-center">Explore Our Products</h1>
          
          {/* Search and Filters */}
          <SearchAndFilters
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            categories={categories}
            loading={loading}
          />

          {/* Results Summary */}
          {!loading && !error && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Showing {products.length} of {totalProducts} products
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6">
              <ErrorMessage 
                message={error} 
                onRetry={retry} 
                showRetry={true} 
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              {productsGrid}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
