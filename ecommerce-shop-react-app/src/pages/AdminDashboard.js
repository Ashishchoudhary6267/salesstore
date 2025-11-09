import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import { 
  FiPackage, 
  FiShoppingBag, 
  FiHome,
  FiLogOut 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.firstName} {user?.lastName}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <FiHome className="text-lg" />
                <span>Back to Store</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiPackage className="text-lg" />
                <span>Product Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-lg" />
                <span>Order Management</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;

