import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store';
import { deleteProduct, updateProduct, uploadProductImage } from '../../store/slices/productsSlice';
import ProductImageCarousel from '../products/ProductImageCarousel';
import Loader from '../common/Loader';
import ProductCardSkeleton from '../common/ProductCardSkeleton';
import EditProductModal from '../modals/EditProductModal';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import './ProductsTab.css';

interface ProductsTabProps { }

const ProductsTab: React.FC<ProductsTabProps> = () => {
    const dispatch = useAppDispatch();
    const { products, loading: productsLoading } = useAppSelector((state: RootState) => state.products);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                // alert('Product deleted successfully');
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleEditClick = (product: any) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (formData: any, file: File | null) => {
        if (selectedProduct) {
            try {
                await dispatch(updateProduct({ id: selectedProduct.id, data: formData })).unwrap();
                if (file) {
                    await dispatch(uploadProductImage({ id: selectedProduct.id, file })).unwrap();
                }
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                // alert('Product updated successfully');
            } catch (error) {
                console.error('Failed to update product', error);
                alert('Failed to update product');
            }
        }
    };


    return (
        <div className="products-tab-container">
            <h2>Products</h2>
            <div className="products-grid">
                {productsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                ) : products.length === 0 ? (
                    <div className="products-no-data">
                        No products found
                    </div>
                ) : (
                    products.map((product: any, index: number) => (
                        <div key={product.id || index} className={`product-card ${!product.inStock ? 'product-card-out-of-stock' : ''}`}>
                            {/* Product Image Carousel */}
                            {product.buffalo_images && product.buffalo_images.length > 0 && (
                                <ProductImageCarousel
                                    images={product.buffalo_images}
                                    breed={product.breed}
                                    inStock={product.inStock}
                                />
                            )}

                            {/* Product Details */}
                            <div className="product-details">
                                <div className="product-header">
                                    <h3 className="product-title">
                                        {product.breed}
                                    </h3>
                                    <span className={`product-status-badge ${product.inStock ? 'status-in-stock' : 'status-out-of-stock'}`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="product-meta-info">
                                    <div className="product-meta-item">
                                        <strong>Age:</strong> {product.age} years
                                    </div>
                                    <div className="product-meta-item">
                                        <strong>Location:</strong> {product.location}
                                    </div>
                                    <div className="product-meta-item">
                                        <strong>ID:</strong> {product.id}
                                    </div>
                                </div>

                                <p className="product-description">
                                    {product.description}
                                </p>

                                <div className="product-footer">
                                    <div>
                                        <div className="product-price">
                                            ₹{product.price?.toLocaleString()}
                                        </div>
                                        <div className="product-insurance">
                                            Insurance: ₹{product.insurance?.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="product-actions">
                                        <button
                                            className="action-btn menu-btn"
                                            onClick={(e) => toggleMenu(product.id, e)}
                                            title="More Options"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {activeMenuId === product.id && (
                                            <div className="action-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="menu-item"
                                                    onClick={() => {
                                                        handleEditClick(product);
                                                        setActiveMenuId(null);
                                                    }}
                                                >
                                                    <Edit size={16} />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className="menu-item delete-item"
                                                    onClick={() => {
                                                        handleDelete(product.id);
                                                        setActiveMenuId(null);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductsTab;
