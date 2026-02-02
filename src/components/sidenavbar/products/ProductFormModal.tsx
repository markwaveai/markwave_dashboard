import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { addProduct, updateProduct } from '../../../store/slices/productsSlice';


interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any; // If provided, it's an edit mode
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, product }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        breed: '',
        age: '3',
        location: '',
        price: '175000',
        cpf: '15000',
        buffaloId: 'BID-001',
        description: '',
        inStock: true,
        images: null as FileList | null
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                breed: product.breed || '',
                age: product.age || '',
                location: product.location || '',
                price: product.price || '',
                cpf: product.cpf || '15000',
                buffaloId: product.buffaloId || 'BID-001',
                description: product.description || '',
                inStock: product.inStock !== false, // Default to true if undefined
                images: null
            });
        } else {
            setFormData({
                breed: '',
                age: '3',
                location: '',
                price: '175000',
                cpf: '15000',
                buffaloId: 'BID-001',
                description: '',
                inStock: true,
                images: null
            });
            setPreviewUrls([]);
        }
    }, [product, isOpen]);

    useEffect(() => {
        // Cleanup function to revoke object URLs to avoid memory leaks
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            setFormData(prev => ({ ...prev, images: files }));

            // Generate preview URLs
            if (files && files.length > 0) {
                const urls = Array.from(files).map(file => URL.createObjectURL(file));
                setPreviewUrls(prev => {
                    // Revoke old previews
                    prev.forEach(url => URL.revokeObjectURL(url));
                    return urls;
                });
            } else {
                setPreviewUrls(prev => {
                    prev.forEach(url => URL.revokeObjectURL(url));
                    return [];
                });
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('breed', formData.breed);
            formDataToSend.append('age', formData.age);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('cpf', formData.cpf);
            formDataToSend.append('buffaloId', formData.buffaloId);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('inStock', String(formData.inStock));

            if (formData.images && formData.images.length > 0) {
                for (let i = 0; i < formData.images.length; i++) {
                    formDataToSend.append('images', formData.images[i]);
                }
            }

            if (product) {
                await dispatch(updateProduct({ id: product.id, data: formDataToSend })).unwrap();
            } else {
                await dispatch(addProduct(formDataToSend)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Breed / Title</label>
                            <input
                                type="text"
                                name="breed"
                                value={formData.breed}
                                onChange={handleChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="e.g. Murrah Buffalo"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Age (years)</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                                min="0"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">CPF Cost</label>
                            <input
                                type="text"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-sm font-semibold text-gray-700">Buffalo ID</label>
                        <input
                            type="text"
                            name="buffaloId"
                            value={formData.buffaloId}
                            onChange={handleChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-sm font-semibold text-gray-700">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm min-h-[100px] resize-y"
                        />
                    </div>

                    {/* Image Upload in Form */}
                    <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-sm font-semibold text-gray-700">Product Images</label>
                        <div className="relative">
                            <input
                                type="file"
                                name="images"
                                onChange={handleChange}
                                multiple={true}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-300 rounded-lg"
                            />
                        </div>
                        <small className="text-xs text-gray-500 mt-1">
                            {product ? 'Upload to add/replace images' : 'Select images for the product'}
                        </small>
                    </div>

                    {/* Image Previews */}
                    {(previewUrls.length > 0 || (product?.buffalo_images?.length > 0)) && (
                        <div className="flex flex-col gap-1.5 mb-6">
                            <label className="text-sm font-semibold text-gray-700">Selected Previews</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-1">
                                {previewUrls.length > 0 ? (
                                    previewUrls.map((url, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))
                                ) : (
                                    product?.buffalo_images?.map((img: string, index: number) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                                            <img src={img} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-2 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, inStock: !prev.inStock }))}>
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="inStock"
                                id="inStock"
                                checked={formData.inStock}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Available in Stock</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
                        <button type="button" className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all active:scale-95 text-sm" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-500/30 font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 text-sm" disabled={loading}>
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
