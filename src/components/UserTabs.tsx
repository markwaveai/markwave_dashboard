import React, { useState, useEffect } from 'react';
import './UserTabs.css';
import BuffaloTree from './BuffaloTree';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useTableSortAndSearch } from '../hooks/useTableSortAndSearch';
import { LayoutDashboard, Users, TreePine, ShoppingBag, LogOut, UserCheck, PanelLeft, PanelLeftClose, Search, Settings, Bell, Home, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import HealthStatus from './HealthStatus';


interface UserTabsProps {
  adminMobile: string;
  adminName: string;
  adminRole: string;
  lastLogin?: string;
  presentLogin?: string;
  onLogout: () => void;
}

// Product Image Carousel Component
const ProductImageCarousel: React.FC<{ images: string[], breed: string, inStock: boolean }> = ({ images, breed, inStock }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  return (
    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
      <img
        src={images[currentImageIndex]}
        alt={`${breed} - Image ${currentImageIndex + 1}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: inStock ? 'none' : 'grayscale(30%)'
        }}
      />

      {/* Navigation arrows - only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Image indicators - only show if multiple images */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px'
        }}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}

      {/* Out of stock overlay */}
      {!inStock && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#dc2626',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Out of Stock
        </div>
      )}
    </div>
  );
};

// Modal to show ID Proof image names
const ImageNamesModal: React.FC<{ isOpen: boolean; onClose: () => void; data: any }> = ({ isOpen, onClose, data }) => {
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !data) return null;

  // Heuristic to find image-like fields

  const isImage = (key: string, value: any) => {
    // console.log(value);
    if (typeof value !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const lowerValue = value.toLowerCase();
    return (
      lowerKey.includes('image') ||
      lowerKey.includes('photo') ||
      lowerKey.includes('proof') ||
      lowerKey.includes('card') ||
      lowerValue.match(/\.(jpeg|jpg|png|gif|webp)(\?.*)?$/)
    );
  };

  const imageFields: [string, any][] = [];

  // Check top level fields
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (isImage(key, value)) {
        imageFields.push([key, value]);
      }
    });

    // Check transaction object fields
    if (data.transaction && typeof data.transaction === 'object') {
      Object.entries(data.transaction).forEach(([key, value]) => {
        if (isImage(key, value)) {
          imageFields.push([`Transaction: ${key}`, value]);
        }
      });
    }
  }

  const handleClose = () => {
    setViewingImage(null);
    setIsLoading(false);
    onClose();
  };

  const handleViewImage = (url: string) => {
    setViewingImage(url);
    setIsLoading(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={handleClose}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: viewingImage ? '500px' : 'auto', // Fixed minimum height when viewing image
        transition: 'min-height 0.3s ease'
      }} onClick={e => e.stopPropagation()}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 10
          }}
        >
          ×
        </button>

        {viewingImage ? (
          // View Image Mode
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              View Document
            </h3>

            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              background: '#f3f4f6',
              borderRadius: '4px',
              marginBottom: '16px',
              position: 'relative',
              minHeight: '400px' // Fixed container height
            }}>
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</span>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}
              <img
                src={viewingImage}
                alt="ID Proof"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  opacity: isLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setViewingImage(null)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                &larr; Back to List
              </button>
              <a
                href={viewingImage}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Open Original
              </a>
            </div>
          </div>
        ) : (
          // List Mode
          <>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              Payment Proof Files: {data.name}
            </h3>

            {imageFields.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No Payment proof documents found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {imageFields.map(([key, value]) => (
                  <div key={key} style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {key}
                    </div>
                    <button
                      onClick={() => handleViewImage(String(value))}
                      style={{
                        fontSize: '12px',
                        color: '#2563eb',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Admin Details Modal
const AdminDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminMobile: string;
  adminRole: string;
  lastLogin?: string;
  presentLogin?: string;
}> = ({ isOpen, onClose, adminName, adminMobile, adminRole, lastLogin, presentLogin }) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1999, background: 'transparent' }}>
      <div
        className="admin-popover"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 2000,
          padding: '1.25rem'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1
          }}
        >
          ×
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5',
            fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {adminName.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h2 style={{ margin: '0', fontSize: '1rem', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{adminMobile}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Role</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>{adminName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Last Login</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>{lastLogin || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Present Login</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>{presentLogin || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserTabs: React.FC<UserTabsProps> = ({ adminMobile, adminName, adminRole, lastLogin, presentLogin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'nonVerified' | 'existing' | 'tree' | 'products'>('orders');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    refered_by_mobile: '',
    refered_by_name: '',
    role: 'Investor',
  });
  // Sidebar Toggle State - Auto close on mobile/tablet (< 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [showAdminDetails, setShowAdminDetails] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [editFormData, setEditFormData] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    refered_by_mobile: '',
    refered_by_name: '',
  });

  // ID Proof Modal State

  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProofData, setSelectedProofData] = useState<any>(null);


  const [referralUsers, setReferralUsers] = useState<any[]>([]);
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pendingUnits, setPendingUnits] = useState<any[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [statusFilter, setStatusFilter] = useState("PENDING_ADMIN_VERIFICATION");



  // --- Referral Users Table Logic ---
  const {
    filteredData: filteredReferrals,

    sortConfig: referralSortConfig,
    requestSort: requestReferralSort,
  } = useTableSortAndSearch(referralUsers, { key: '', direction: 'asc' });

  // --- Existing Users Table Logic ---
  const {
    filteredData: filteredExistingUsers,

    sortConfig: existingUsersSortConfig,
    requestSort: requestExistingUsersSort,
  } = useTableSortAndSearch(existingCustomers, { key: '', direction: 'asc' });

  const getSortIcon = (key: string, currentSortConfig: any) => {
    if (currentSortConfig.key !== key) return '';
    return currentSortConfig.direction === 'asc' ? '↑' : '↓';
  };


  useEffect(() => {
    const fetchReferralUsers = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getReferrals());
        setReferralUsers(response.data.users || []);
      } catch (error) {
        setReferralUsers([]); // Clear users on error
      }
    };


    const fetchExistingCustomers = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getUsers());
        setExistingCustomers(response.data.users || []);
      } catch (error) {
        setExistingCustomers([]); // Clear users on error
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getProducts());
        // Extract products array from the response structure
        const productsData = response.data?.products || [];
        console.log(productsData)
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Clear products on error
      }
    };

    // Only fetch data for the user-related tabs. The 'tree' tab is client-side.
    if (activeTab === 'orders') {
      fetchPendingUnits();
    } else if (activeTab === 'nonVerified') {
      fetchReferralUsers();
    } else if (activeTab === 'existing') {
      fetchExistingCustomers();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchPendingUnits = async () => {
    try {
      setOrdersError(null);
      const response = await axios.get(API_ENDPOINTS.getPendingUnits(), {
        headers: {
          'X-Admin-Mobile': adminMobile,

        },
      });
      const units = response.data?.orders || [];

      setPendingUnits(units);
    } catch (error: any) {
      console.error('Error fetching pending units:', error);
      const rawDetail = error?.response?.data?.detail;
      let msg: string;
      if (typeof rawDetail === 'string') {
        msg = rawDetail;
      } else if (Array.isArray(rawDetail)) {
        const first = rawDetail[0];
        if (first && typeof first === 'object' && 'msg' in first) {
          msg = String(first.msg);
        } else {
          msg = 'Failed to load orders';
        }
      } else if (rawDetail && typeof rawDetail === 'object' && 'msg' in rawDetail) {
        msg = String(rawDetail.msg);
      } else {
        msg = 'Failed to load orders';
      }
      setOrdersError(msg);
      setPendingUnits([]);
    }
  };

  const handleApproveClick = async (unitId: string) => {

    try {
      await axios.post(API_ENDPOINTS.approveUnit(), { orderId: unitId }, {
        headers: {
          'X-Admin-Mobile': adminMobile,
        }
      });
      alert('Order approved successfully!');
      fetchPendingUnits();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order.');
    }
  };
  const handleReject = async (unitId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    try {
      await axios.post(API_ENDPOINTS.rejectUnit(), { orderId: unitId }, {
        headers: {
          'X-Admin-Mobile': adminMobile,
        }
      });
      alert('Order rejected successfully!');
      fetchPendingUnits();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order.');
    }
  };

  const handleCreateClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchReferrerDetails = async (mobile: string, isEditMode: boolean = false) => {
    if (!mobile || mobile.length < 10) return;

    try {
      const response = await axios.get(API_ENDPOINTS.getUserDetails(mobile));
      if (response.data && response.data.user) {
        const user = response.data.user;
        let fullName = '';

        if (user.first_name || user.last_name) {
          fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        } else if (user.name) {
          fullName = user.name;
        }

        if (isEditMode) {
          setEditFormData(prev => ({
            ...prev,
            refered_by_name: fullName
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            refered_by_name: fullName
          }));
        }
      }
    } catch (error) {
      console.log('Referrer not found or error fetching details');
      // Optional: Clear the name field if user not found? 
      // For now, let's keep the user input or allow manual entry if API fails.
    }
  };

  const handleReferralMobileBlur = () => {
    fetchReferrerDetails(formData.refered_by_mobile, false);
  };

  const handleEditReferralMobileBlur = () => {
    fetchReferrerDetails(editFormData.refered_by_mobile, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_ENDPOINTS.createUser(), {
        mobile: formData.mobile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        refered_by_mobile: formData.refered_by_mobile,
        refered_by_name: formData.refered_by_name,
        role: formData.role,
      });

      console.log('User response:', response.data);

      // Check if user already exists
      if (response.data.message === 'User already exists') {
        alert('User already exists with this mobile number.');
      } else {
        alert('User created successfully!');
      }

      // Close modal and reset form
      setShowModal(false);
      setFormData({
        mobile: '',
        first_name: '',
        last_name: '',
        refered_by_mobile: '',
        refered_by_name: '',
        role: 'Investor',
      });

      // Refresh the referral users list
      if (activeTab === 'nonVerified') {
        const refreshResponse = await axios.get(API_ENDPOINTS.getReferrals());
        setReferralUsers(refreshResponse.data.users || []);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const handleRowClick = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      refered_by_mobile: user.refered_by_mobile || '',
      refered_by_name: user.refered_by_name || '',
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(API_ENDPOINTS.updateUser(editingUser.mobile), {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        refered_by_mobile: editFormData.refered_by_mobile,
        refered_by_name: editFormData.refered_by_name,
      });

      console.log('User updated:', response.data);
      alert('User updated successfully!');

      // Close modal and reset form
      setShowEditModal(false);
      setEditingUser(null);
      setEditFormData({
        mobile: '',
        first_name: '',
        last_name: '',
        refered_by_mobile: '',
        refered_by_name: '',
      });

      // Refresh the referral users list
      const refreshResponse = await axios.get(API_ENDPOINTS.getReferrals());
      setReferralUsers(refreshResponse.data.users || []);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };
  const handleViewProof = (transaction: any, investor: any) => {
    setSelectedProofData({ ...transaction, name: investor.name });
    setShowProofModal(true);
  };

  const handleCloseProofModal = () => {
    setShowProofModal(false);
    setSelectedProofData(null);
  };

  const filteredUnits = pendingUnits.filter((entry: any) => {
    const unit = entry.order || {};
    const tx = entry.transaction || {};
    const inv = entry.investor || {};


    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLocaleLowerCase();
      matchesSearch = (
        (unit.id && String(unit.id).toLocaleLowerCase().includes(query)) ||
        (unit.userId && String(unit.userId).toLocaleLowerCase().includes(query)) ||
        (unit.breedId && String(unit.breedId).toLocaleLowerCase().includes(query)) ||
        (inv.name && String(inv.name).toLocaleLowerCase().includes(query))
      )
    }

    // 2. Payment Filter
    let matchesPayment = true;
    if (paymentFilter !== 'All Payments') {
      matchesPayment = tx.paymentType === paymentFilter;
    }

    // 3. Status Filter
    let matchesStatus = true;
    if (statusFilter !== 'All Status') {
      matchesStatus = unit.paymentStatus === statusFilter;
    }

    return matchesSearch && matchesPayment && matchesStatus;
  });

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Global Header - Full Width */}
      <header style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'var(--bg-color)', /* Match bg */
        position: 'relative',
        zIndex: 101, /* Above sidebar */
        height: '60px' // Check height
      }}>
        {/* Mobile Menu Toggle - Visible only on mobile */}
        {/* Mobile Menu Toggle - Always visible on mobile to toggle state */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: 'absolute',
            left: '2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#344767',
            display: 'none' // Hidden by default, shown via CSS on mobile
          }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Centered Title */}
        <h6 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#344767'
        }}>
          Animalkart Dashboard
        </h6>

        {/* Right Status - Absolutely positioned */}
        <div style={{
          position: 'absolute',
          right: '2rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <HealthStatus />
          </div>
        </div>
      </header>

      {/* Main Body Layout (Sidebar + Content) */}
      <div className="layout-body">
        {/* Sidebar */}
        <nav className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: isSidebarOpen ? 'space-between' : 'center', alignItems: 'center', minHeight: '32px' }}>
            {isSidebarOpen && (
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#344767', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', background: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <LayoutDashboard size={14} />
                </div>
                MarkWave
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex' }}
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
          </div>

          <ul className="sidebar-menu">
            <li>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
                title={!isSidebarOpen ? "Orders" : ""}
              >
                <LayoutDashboard />
                <span className="nav-text">Orders</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'nonVerified' ? 'active' : ''}`}
                onClick={() => setActiveTab('nonVerified')}
                title={!isSidebarOpen ? "Referral" : ""}
              >
                <Users />
                <span className="nav-text">Referral</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'existing' ? 'active' : ''}`}
                onClick={() => setActiveTab('existing')}
                title={!isSidebarOpen ? "Verified Users" : ""}
              >
                <UserCheck />
                <span className="nav-text">Verified Users</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => setActiveTab('tree')}
                title={!isSidebarOpen ? "Buffalo Tree" : ""}
              >
                <TreePine />
                <span className="nav-text">Buffalo Tree</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
                title={!isSidebarOpen ? "Products" : ""}
              >
                <ShoppingBag />
                <span className="nav-text">Products</span>
              </button>
            </li>
          </ul>

          <div className="sidebar-footer">

            <div className="user-profile" onClick={() => setShowAdminDetails(true)} style={{ cursor: 'pointer' }}>
              <div className="avatar-circle">{adminName.charAt(0)}</div>
              <div className="user-info">
                <span className="user-name">{adminName}</span>
                <span className="user-email">{adminMobile}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout} title={!isSidebarOpen ? "Logout" : ""}>
              <LogOut size={18} />
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Soft UI Header / Breadcrumbs */}

          <div className="tab-content">
            {/* Content will be rendered here based on activeTab */}
            {activeTab === 'orders' && (
              <div className="orders-dashboard">
                <h2>Live Orders (Pending Approval)</h2>
                {/* Stats Widgets */}
                <div className="stats-grid">
                  <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 27px 0 rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#67748e', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px 0' }}>Pending Orders</p>
                        <h5 style={{ color: '#344767', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                          {pendingUnits.filter((u: any) => u.order?.paymentStatus === 'PENDING_PAYMENT' || u.order?.paymentStatus === 'PENDING_ADMIN_VERIFICATION').length}
                        </h5>
                      </div>
                      <div style={{ width: '48px', height: '48px', background: 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <ShoppingBag size={24} />
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ color: '#82d616', fontWeight: 700, fontSize: '0.875rem' }}>+15%</span>
                      <span style={{ color: '#67748e', fontSize: '0.875rem', marginLeft: '4px' }}>since last week</span>
                    </div>
                  </div>



                  <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 27px 0 rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#67748e', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px 0' }}>Approved Orders</p>
                        <h5 style={{ color: '#344767', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                          {pendingUnits.filter((u: any) => u.order?.paymentStatus === 'Approved' || u.order?.paymentStatus === 'PAID').length}
                        </h5>
                      </div>
                      <div style={{ width: '48px', height: '48px', background: 'linear-gradient(310deg, #17ad37 0%, #98ec2d 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <CheckCircle size={24} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 27px 0 rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#67748e', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px 0' }}>Rejected Orders</p>
                        <h5 style={{ color: '#344767', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                          {pendingUnits.filter((u: any) => u.order?.paymentStatus === 'Rejected' || u.order?.paymentStatus === 'REJECTED').length}
                        </h5>
                      </div>
                      <div style={{ width: '48px', height: '48px', background: 'linear-gradient(310deg, #ea0606 0%, #ff667c 100%)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <XCircle size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="filter-controls">
                  <input
                    type="text"
                    placeholder="Search By User Name,Unit Id,User Mobile,Buffalo Id"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    className="filter-select"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                  >
                    <option value="All Payments">All Payments</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="ONLINE_UPI">Online/UPI</option>
                  </select>

                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All Status">All Status</option>
                    <option value="PENDING_ADMIN_VERIFICATION">Needs Approval</option>
                    <option value="PENDING_PAYMENT">Not Paid(Draft)</option>
                    <option value="PAID">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {ordersError && (
                  <div style={{ marginBottom: '0.75rem', color: '#dc2626' }}>{ordersError}</div>
                )}

                <div className="table-container">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>User Name</th>
                        <th>Unit Id</th>
                        <th>User Mobile</th>
                        <th>Email</th>
                        <th>Units</th>
                        <th>Amount</th>
                        <th>Payment Type</th>
                        <th>Payment Image Proof</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnits.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>
                            {searchQuery ? 'No matching orders found' : 'No pending orders'}
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((entry: any, index: number) => {
                          const unit = entry.order || {};
                          const tx = entry.transaction || {};
                          const inv = entry.investor || {};
                          return (
                            <tr key={unit.id || index}>
                              <td>{index + 1}</td>
                              <td >{inv.name}</td>
                              <td>{unit.id}</td>
                              <td>{inv.mobile}</td>
                              <td>{inv.email || '-'}</td>
                              <td>{unit.numUnits}</td>
                              <td>{tx.amount ?? '-'}</td>
                              <td>{tx.paymentType || '-'}</td>
                              <td >
                                {unit.paymentType && (
                                  <button
                                    className="view-proof-btn"
                                    onClick={() => handleViewProof(tx, inv)}
                                  >
                                    Payment Proof
                                  </button>
                                ) || '-'}
                              </td>
                              <td>
                                <span className={`status-badge ${(unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_PAYMENT') ? 'pending' :
                                  unit.paymentStatus === 'Approved' ? 'approved' :
                                    unit.paymentStatus === 'Rejected' ? 'rejected' : ''
                                  }`}>
                                  {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' ? 'PENDING_ADMIN_VERIFICATION' :
                                    unit.paymentStatus === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' :
                                      unit.paymentStatus || '-'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                    <button
                                      onClick={() => handleApproveClick(unit.id)}
                                      className="action-btn approve"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {(unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_PAYMENT') && (
                                    <button
                                      onClick={() => handleReject(unit.id)}
                                      className="action-btn reject"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            )}

            {activeTab === 'nonVerified' && (
              <div>
                <h2>Referrals</h2>

                <div className="table-container">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th style={{ cursor: 'pointer', textAlign: 'center' }}>
                          Name
                        </th>
                        <th style={{ cursor: 'pointer', textAlign: 'center' }} >
                          Mobile
                        </th>
                        <th style={{ cursor: 'pointer', textAlign: 'center' }} >
                          Role
                        </th>
                        <th style={{ cursor: 'pointer', textAlign: 'center' }} >
                          Referred By
                        </th>
                        <th style={{ cursor: 'pointer', textAlign: 'center' }} >
                          Referrer Mobile
                        </th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReferrals.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No users found</td>
                        </tr>
                      ) : (
                        filteredReferrals.map((user: any, index: number) => (
                          <tr key={index}>
                            <td style={{ textAlign: 'center' }}>{user.first_name} {user.last_name}</td>
                            <td style={{ textAlign: 'center' }}>{user.mobile}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#f3f4f6',
                                fontSize: '11px',
                                fontWeight: '500',
                                color: '#374151',
                                border: '1px solid #e5e7eb'
                              }}>
                                {user.role || 'Investor'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>{user.refered_by_name || '-'}</td>
                            <td style={{ textAlign: 'center' }}>{user.refered_by_mobile || '-'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleRowClick(user)}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2563eb';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#3b82f6';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {
              activeTab === 'existing' && (
                <div>
                  <h2>Verified Users</h2>

                  <div className="table-container">
                    <table className="user-table">
                      <thead>
                        <tr>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('first_name')}>First Name {getSortIcon('first_name', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('last_name')}>Last Name {getSortIcon('last_name', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('mobile')}>Mobile {getSortIcon('mobile', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('isFormFilled')}>Form Filled {getSortIcon('isFormFilled', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('refered_by_name')}>Referred By {getSortIcon('refered_by_name', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('refered_by_mobile')}>Referrer Mobile {getSortIcon('refered_by_mobile', existingUsersSortConfig)}</th>
                          <th style={{ whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestExistingUsersSort('verified')}>Verified {getSortIcon('verified', existingUsersSortConfig)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExistingUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No users found</td>
                          </tr>
                        ) : (
                          filteredExistingUsers.map((user: any, index: number) => (
                            <tr key={index}>
                              <td style={{ textAlign: 'center' }}>{user.first_name || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{user.last_name || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{user.mobile}</td>
                              <td style={{ textAlign: 'center' }}>{user.isFormFilled ? 'Yes' : 'No'}</td>
                              <td style={{ textAlign: 'center' }}>{user.refered_by_name || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{user.refered_by_mobile || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{user.verified ? 'Yes' : 'No'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


            {
              activeTab === 'tree' && (
                <div>
                  {/* Buffalo Tree tab content */}
                  <div style={{ padding: '1rem' }}>
                    <h2>Buffalo Family Tree</h2>
                    <div className="tree-wrapper">
                      {/* Render BuffaloTree component */}
                      <div id="buffalo-tree-root">
                        <BuffaloTree />
                      </div>
                    </div>
                  </div>
                </div>

              )
            }

            {
              activeTab === 'products' && (
                <div style={{ padding: '1rem' }}>
                  <h2>Products</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1rem'
                  }}>
                    {products.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '2rem' }}>
                        No products found
                      </div>
                    ) : (
                      products.map((product: any, index: number) => (
                        <div key={product.id || index} style={{
                          background: '#fff',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                          opacity: product.inStock ? 1 : 0.6,
                          filter: product.inStock ? 'none' : 'grayscale(50%)'
                        }}>
                          {/* Product Image Carousel */}
                          {product.buffalo_images && product.buffalo_images.length > 0 && (
                            <ProductImageCarousel
                              images={product.buffalo_images}
                              breed={product.breed}
                              inStock={product.inStock}
                            />
                          )}

                          {/* Product Details */}
                          <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111' }}>
                                {product.breed}
                              </h3>
                              <span style={{
                                background: product.inStock ? '#10b981' : '#dc2626',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            <div style={{ marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                                <strong>Age:</strong> {product.age} years
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                                <strong>Location:</strong> {product.location}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                <strong>ID:</strong> {product.id}
                              </div>
                            </div>

                            <p style={{
                              fontSize: '0.875rem',
                              color: '#374151',
                              lineHeight: '1.4',
                              margin: '0 0 1rem 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {product.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111' }}>
                                  ₹{product.price?.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  Insurance: ₹{product.insurance?.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            }
          </div >
        </main >

        {/* Floating + Icon at bottom left - only show on Referral tab */}
        {
          activeTab === 'nonVerified' && (
            <button
              onClick={handleCreateClick}
              style={{
                position: 'fixed',
                bottom: '32px',
                right: '32px', // Moved to right for better UX with sidebar
                left: 'auto',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
              aria-label="Add New Referral"
            >
              +
            </button>
          )
        }

        {
          showModal && (
            <div className="modal" onClick={handleCloseModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleCloseModal}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  ×
                </button>
                <h3>Add New Referral</h3>
                <form onSubmit={handleSubmit}>
                  <label>
                    Role:
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="Investor">Investor</option>
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </label>
                  <label>
                    Mobile:
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter mobile number"
                    />
                  </label>
                  <label>
                    First Name:
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </label>
                  <label>
                    Last Name:
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </label>
                  <label>
                    Referral(Mobile):
                    <input
                      type="tel"
                      name="refered_by_mobile"
                      value={formData.refered_by_mobile}
                      onChange={handleInputChange}
                      onBlur={handleReferralMobileBlur}
                      required={formData.role === 'Investor'}
                      placeholder="Enter referrer's mobile"
                    />
                  </label>
                  <label>
                    Referral(Name):
                    <input
                      type="text"
                      name="refered_by_name"
                      value={formData.refered_by_name}
                      onChange={handleInputChange}
                      required={formData.role === 'Investor'}
                      placeholder="Enter referrer's name"
                    />
                  </label>
                  <button type="submit">Submit</button>
                  <button type="button" onClick={handleCloseModal}>Cancel</button>
                </form>
              </div>
            </div>
          )
        }

        {/* Edit Modal */}
        {
          showEditModal && editingUser && (
            <div className="modal" onClick={handleCloseEditModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleCloseEditModal}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  ×
                </button>
                <h3>Edit Referral</h3>
                <form onSubmit={handleEditSubmit}>
                  <label>
                    Mobile:
                    <input
                      type="tel"
                      name="mobile"
                      value={editFormData.mobile}
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                      placeholder="Mobile number (cannot be changed)"
                    />
                  </label>
                  <label>
                    Role:
                    <input
                      type="text"
                      name="role"
                      value={editingUser.role || 'Investor'}
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </label>
                  <label>
                    First Name:
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </label>
                  <label>
                    Last Name:
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </label>
                  <label>
                    Referred By(Mobile):
                    <input
                      type="tel"
                      name="refered_by_mobile"
                      value={editFormData.refered_by_mobile}
                      onChange={handleEditInputChange}
                      onBlur={handleEditReferralMobileBlur}
                      required
                      placeholder="Enter referrer's mobile"
                    />
                  </label>
                  <label>
                    Referred By(Name):
                    <input
                      type="text"
                      name="refered_by_name"
                      value={editFormData.refered_by_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter referrer's name"
                    />
                  </label>
                  <button type="submit">Update</button>
                  <button type="button" onClick={handleCloseEditModal}>Cancel</button>
                </form>
              </div>
            </div>
          )
        }



        <ImageNamesModal
          isOpen={showProofModal}
          onClose={handleCloseProofModal}
          data={selectedProofData}
        />

        <AdminDetailsModal
          isOpen={showAdminDetails}
          onClose={() => setShowAdminDetails(false)}
          adminName={adminName}
          adminMobile={adminMobile}
          adminRole={adminRole}
          lastLogin={lastLogin}
          presentLogin={presentLogin}
        />

      </div>
    </div >
  );
};

export default UserTabs;