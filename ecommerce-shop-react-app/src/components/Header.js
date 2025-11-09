import React, { useContext, useEffect, useState } from "react";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Logo from "../img/logo.svg";
import { BsBag, BsPerson } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";

const Header = () => {
  // header state
  const [isActive, setIsActive] = useState(false);
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  const { itemAmount } = useContext(CartContext);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  // event listener
  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 60 ? setIsActive(true) : setIsActive(false);
    });
  });

  return (
    <header
      className={`${
        isActive ? "bg-white py-4 shadow-md" : "bg-none py-6"
      } fixed w-full z-10 lg:px-8 transition-all`}
    >
      <div className="container mx-auto flex items-center justify-between h-full">
        <Link to={"/"}>
          <div className="w-[40px]">
            <img src={Logo} alt="" />
          </div>
        </Link>

        {/* user menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hello, {user?.firstName}
              </span>
              <Link
                to="/profile"
                className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
              >
                <BsPerson className="text-xl" />
                <span className="text-sm">Profile</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  title="Admin Dashboard"
                >
                  <FiSettings className="text-xl" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* cart */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer flex relative"
          >
            <BsBag className="text-2xl" />
            <div className="bg-red-500 absolute -right-2 -bottom-2 text-[12px] w-[18px] h-[18px] text-white rounded-full flex justify-center items-center">
              {itemAmount}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
