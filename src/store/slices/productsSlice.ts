import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Async Thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.getProducts());
            return response.data?.products || [];
        } catch (error: any) {
            return rejectWithValue('Failed to fetch products');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(API_ENDPOINTS.deleteProduct(id)); // Assuming API supports DELETE
            return id;
        } catch (error: any) {
            return rejectWithValue('Failed to delete product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await axios.put(API_ENDPOINTS.updateProduct(id), data); // Assuming API supports PUT
            return response.data?.product || { id, ...data }; // Use returned data or fallback
        } catch (error: any) {
            return rejectWithValue('Failed to update product');
        }
    }
);

export const uploadProductImage = createAsyncThunk(
    'products/uploadProductImage',
    async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await axios.post(API_ENDPOINTS.uploadProductImage(id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { id, images: response.data?.images || [] };
        } catch (error: any) {
            return rejectWithValue('Failed to upload product image');
        }
    }
);

export interface ProductsState {
    products: any[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    products: [],
    loading: false,
    error: null,
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<any[]>) => {
            state.products = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload;
        });
        builder.addCase(fetchProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Delete Product
        builder.addCase(deleteProduct.fulfilled, (state, action) => {
            state.products = state.products.filter(product => product.id !== action.payload);
        });

        // Update Product
        builder.addCase(updateProduct.fulfilled, (state, action) => {
            const index = state.products.findIndex(product => product.id === action.payload.id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
        });

        // Upload Product Image
        builder.addCase(uploadProductImage.fulfilled, (state, action) => {
            const index = state.products.findIndex(product => product.id === action.payload.id);
            if (index !== -1) {
                // Update images based on returned data, assuming payload contains updated image list
                if (action.payload.images) {
                    state.products[index].buffalo_images = action.payload.images;
                }
            }
        });
    }
});

export const { setProducts } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
export default productsSlice.reducer;
