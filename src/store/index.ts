import { configureStore } from '@reduxjs/toolkit';

import { authReducer, AuthState } from './slices/authSlice';
import { uiReducer, UIState } from './slices/uiSlice';
import { ordersReducer, OrdersState } from './slices/ordersSlice';
import { usersReducer, UsersState } from './slices/usersSlice';
import { productsReducer, ProductsState } from './slices/productsSlice';
import { acfReducer, AcfState } from './slices/acfSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        orders: ordersReducer,
        users: usersReducer,
        products: productsReducer,
        acf: acfReducer,
    },
});

export interface RootState {
    auth: AuthState;
    ui: UIState;
    orders: OrdersState;
    users: UsersState;
    products: ProductsState;
    acf: AcfState;
}

export type AppDispatch = typeof store.dispatch;
