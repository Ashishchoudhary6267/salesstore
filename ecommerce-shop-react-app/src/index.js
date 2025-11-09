import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import ToastProvider from "./contexts/ToastContext";
import AuthProvider from "./contexts/AuthContext";
import ProductProvider from "./contexts/ProductContext";
import SidebarProvider from "./contexts/SidebarContext";
import CartProvider from "./contexts/CartContext";
import AppProvider from "./contexts/AppContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ToastProvider>
    <AuthProvider>
      <AppProvider>
        <ProductProvider>
          <SidebarProvider>
            <CartProvider>
              <React.StrictMode>
                <App />
              </React.StrictMode>
            </CartProvider>
          </SidebarProvider>
        </ProductProvider>
      </AppProvider>
    </AuthProvider>
  </ToastProvider>
);
