import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
import appReducer from "./rootReducer";

// const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: appReducer,
    // middleware: [sagaMiddleware],
});