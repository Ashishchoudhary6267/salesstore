import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { FiEye, FiCheck } from 'react-icons/fi';

const OrderManagement = () => {
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch orders
  const fetchOrders = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (status) params.append('status', status);

      const response = await fetch(`http://localhost:5000/api/orders/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } else {
        showError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        success(`Order status updated to ${newStatus}`);
        fetchOrders(currentPage, statusFilter);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(data);
        }
      } else {
        showError(data.message || 'Failed to update order status');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  return (
    <div>
      {/* Header with Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <LoadingSpinner size="lg" text="Loading orders..." />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${order.total?.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-lg" />
                        </button>
                        {getNextStatusOptions(order.status).length > 0 && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value={order.status}>{order.status}</option>
                            {getNextStatusOptions(order.status).map((status) => (
                              <option key={status} value={status}>
                                Mark as {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No orders found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">
                Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiEye className="text-2xl rotate-180" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {selectedOrder.user?.email}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.imageUrl || '/logo512.png'}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/logo512.png';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shipping?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm capitalize">{selectedOrder.payment?.method || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Order Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                    {getNextStatusOptions(selectedOrder.status).length > 0 && (
                      <div className="mt-2">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            handleStatusUpdate(selectedOrder._id, e.target.value);
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-primary"
                        >
                          <option value={selectedOrder.status}>{selectedOrder.status}</option>
                          {getNextStatusOptions(selectedOrder.status).map((status) => (
                            <option key={status} value={status}>
                              Mark as {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

