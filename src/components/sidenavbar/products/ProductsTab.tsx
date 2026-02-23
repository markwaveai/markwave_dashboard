import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { deleteProduct, fetchProducts } from '../../../store/slices/productsSlice';
import ProductImageCarousel from './ProductCarousel';
import ProductCardSkeleton from '../../common/ProductCardSkeleton';
import ProductFormModal from './ProductFormModal';



import { MoreVertical, Edit, Trash2, ShoppingBag } from 'lucide-react';

interface ProductsTabProps { }

const ProductsTab: React.FC<ProductsTabProps> = () => {
    const dispatch = useAppDispatch();
    const { products, loading: productsLoading } = useAppSelector((state: RootState) => state.products);

    React.useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // Close menu when clicking outside (handled via document click listener if needed, 
    // but for now simple toggle is usually enough or we add a global listener)
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
            } catch (error) {
                console.error('Failed to delete product', error);
            }
        }
    };




    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-blue-600 rounded-full inline-block"></span>
                    Products
                </h2>
                <button
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all font-semibold flex items-center gap-2 text-sm"
                    onClick={handleAddProduct}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Product
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {productsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-lg border-2 border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">Get started by creating your first product listing.</p>
                        <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors" onClick={handleAddProduct}>Create Product</button>
                    </div>
                ) : (
                    products.map((product: any, index: number) => (
                        <div key={product.id || index} className={`bg-white rounded shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative group ${!product.inStock ? 'grayscale opacity-75' : ''}`}>
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                {product.buffalo_images && product.buffalo_images.length > 0 ? (
                                    <ProductImageCarousel
                                        images={product.buffalo_images}
                                        breed={product.breed}
                                        inStock={product.inStock}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={48} />
                                    </div>
                                )}
                                {/* Out of Stock Overlay Badge */}
                                {!product.inStock && (
                                    <span className="absolute top-3 right-3 bg-red-400 text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-10 shadow-sm">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-4 flex flex-col flex-1">
                                {/* Title Row */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-base line-clamp-1" title={product.breed}>
                                        {product.breed}
                                    </h3>
                                    {product.inStock && (
                                        <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                            In Stock
                                        </span>
                                    )}
                                </div>

                                {/* Meta Info */}
                                <div className="space-y-1 text-xs text-gray-600 mb-3">
                                    <div>
                                        <span className="font-bold text-gray-700">Age:</span> {product.age} years
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-700">Location:</span> {product.location}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-700">ID:</span> {product.id}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-500 text-xs mb-4 line-clamp-4 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Footer Row */}
                                <div className="flex justify-between items-center mt-auto pt-2">
                                    <div className="text-lg font-bold text-gray-800">
                                        ₹{product.price?.toLocaleString()}
                                    </div>

                                    <div className="relative">
                                        <button
                                            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            onClick={(e) => toggleMenu(product.id, e)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenuId === product.id && (
                                            <div className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded shadow-xl border border-gray-100 overflow-hidden z-20" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                    onClick={() => {
                                                        handleEditProduct(product);
                                                        setActiveMenuId(null);
                                                    }}
                                                >
                                                    <Edit size={12} className="text-blue-500" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                                                    onClick={() => {
                                                        handleDeleteProduct(product.id);
                                                        setActiveMenuId(null);
                                                    }}
                                                >
                                                    <Trash2 size={12} />
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

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />
        </div>
    );
};

export default ProductsTab;
