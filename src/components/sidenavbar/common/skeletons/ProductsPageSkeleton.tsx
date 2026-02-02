import React from 'react';
import ProductCardSkeleton from '../ProductCardSkeleton';

const ProductsPageSkeleton: React.FC = () => {
    return (
        <div className="w-full h-full p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export default ProductsPageSkeleton;
