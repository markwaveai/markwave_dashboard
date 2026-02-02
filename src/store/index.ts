import { configureStore } from '@reduxjs/toolkit';

import { authReducer, AuthState } from './slices/authSlice';
import { uiReducer, UIState } from './slices/uiSlice';
import { ordersReducer, OrdersState } from './slices/ordersSlice';
import { usersReducer, UsersState } from './slices/UsersSlice';
import { productsReducer, ProductsState } from './slices/productsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        orders: ordersReducer,
        users: usersReducer,
        products: productsReducer,
    },
});

export interface RootState {
    auth: AuthState;
    ui: UIState;
    orders: OrdersState;
    users: UsersState;
    products: ProductsState;
}

export type AppDispatch = typeof store.dispatch;
