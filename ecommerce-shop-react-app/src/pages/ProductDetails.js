import React, { useContext, useState, useEffect } from "react";
import { generateProductPlaceholder } from "../utils/placeholder";
import { useApp } from "../contexts/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { ProductContext } from "../contexts/ProductContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useContext(CartContext);
  const { usePlaceholders } = useApp();
  const { products, loading: productsLoading } = useContext(ProductContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single product if not in products list
  useEffect(() => {
    const fetchProduct = async () => {
      // First check if product is in the products list
      const foundProduct = products.find((item) => item.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        return;
      }

      // If not found, fetch from API
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          const withId = { ...data, id: data._id };
          const image = usePlaceholders
            ? generateProductPlaceholder(withId)
            : (withId.imageUrl?.startsWith('/') ? `http://localhost:5000${withId.imageUrl}` : withId.imageUrl);
          const normalized = { ...withId, image };
          setProduct(normalized);
        } else if (response.status === 404) {
          setError('Product not found');
        } else {
          setError('Failed to load product');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, products]);

  // Loading state
  if (loading || productsLoading) {
    return (
      <section className="pt-32 pb-12 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="pt-32 pb-12 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorMessage 
            message={error} 
            onRetry={() => window.location.reload()} 
            showRetry={true} 
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Product not found
  if (!product) {
    return (
      <section className="pt-32 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </section>
    );
  }

  // destructure product
  const { title, price, description, image, category } = product;
  
  return (
    <section className="pt-32 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Products
          </button>
        </nav>

        {/* Product Details */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image */}
          <div className="flex-1 max-w-lg">
            <img 
              className="w-full h-auto rounded-lg shadow-lg" 
              src={image || '/logo512.png'} 
              alt={title}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '/logo512.png';
              }}
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wide">{category}</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h1>
            
            <div className="text-3xl font-bold text-primary mb-6">${price}</div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
            
            <button 
              onClick={() => addToCart(product, product.id)} 
              disabled={cartLoading}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto lg:mx-0"
            >
              {cartLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
