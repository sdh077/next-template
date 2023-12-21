import { configureStore, createSerializableStateInvariantMiddleware, isPlain } from "@reduxjs/toolkit";
import counterReducer from "./features/counterSlice";
import alertReducer from "./features/alertSlice";
import modalReducer from "./features/modalSlice";
import userReducer from "./features/userSlice";

import { userApi } from "./services/userApi";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { menuApi } from "./services/menuApi";


export const store = configureStore({
    reducer: {
        alertReducer,
        counterReducer,
        modalReducer,
        [userApi.reducerPath]: userApi.reducer,
        [menuApi.reducerPath]: menuApi.reducer,
    },
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat([userApi.middleware]).concat([menuApi.middleware])
    ,
});
setupListeners(store.dispatch); // refetchOnFocus Active

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;