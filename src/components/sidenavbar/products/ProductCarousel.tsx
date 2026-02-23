import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageCarouselProps {
    images: string[];
    breed: string;
    inStock: boolean;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, breed, inStock }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full aspect-[4/3] overflow-hidden group/carousel">
            <img
                src={images[currentImageIndex]}
                alt={`${breed} ${currentImageIndex + 1}`}
                className={`w-full h-full object-cover transition-all duration-500 ${!inStock ? 'grayscale-[0.3]' : ''}`}
            />

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors opacity-0 group-hover/carousel:opacity-100"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors opacity-0 group-hover/carousel:opacity-100"
                    >
                        <ChevronRight size={18} />
                    </button>
                </>
            )}

            {/* Image indicators - only show if multiple images */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 rounded-full bg-black/10 backdrop-blur-[2px]">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(index);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageCarousel;

