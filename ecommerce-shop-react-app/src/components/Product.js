import React, { useContext, memo, useCallback } from "react";
import { Link } from "react-router-dom";

import { BsPlus, BsEyeFill } from "react-icons/bs";

import { CartContext } from "../contexts/CartContext";

const Product = memo(({ product }) => {
  const { addToCart, loading } = useContext(CartContext);

  const handleAddToCart = useCallback(() => {
    addToCart(product, product.id);
  }, [addToCart, product]);

  // destructure product
  const { id, image, category, title, price } = product;
  return (
    <div>
      <div className="border border-[#e4e4e4] h-[300px] mb-4 relative overflow-hidden group transition">
        <div className="w-full h-full flex justify-center items-center">
          {/* image */}
          <div className="w-[200px] mx-auto flex justify-center items-center">
            <img
              className="max-h-[160px] group-hover:scale-110 transition duration-300"
              src={image || '/logo512.png'}
              alt={title}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '/logo512.png';
              }}
            />
          </div>
        </div>
        {/* buttons */}
        <div className="absolute top-6 -right-11 group-hover:right-5 p-2 flex flex-col justify-center items-center gap-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className="disabled:opacity-50"
          >
            <div className="flex justify-center items-center text-white w-12 h-12 bg-teal-500">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <BsPlus className="text-3xl" />
              )}
            </div>
          </button>
          <Link
            to={`/product/${id}`}
            className="w-12 h-12 bg-white flex justify-center items-center text-primary drop-shadow-xl"
          >
            <BsEyeFill />
          </Link>
        </div>
      </div>
      {/* category, title & price */}
      <div>
        <div className="tex-sm capitalize text-gray-500 mb-1">{category}</div>
        <Link to={`/product/${id}`}>
          <h2 className="font-semibold mb-1">{title}</h2>
        </Link>

        <h2 className="font-semibbold">$ {price}</h2>
      </div>
    </div>
  );
});



export default Product;
