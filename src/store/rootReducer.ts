import { combineReducers } from "@reduxjs/toolkit";
import locationRadiusSlice from "./Slices/locationRadiusSlice";
import ventorAndMealSlice from "./Slices/ventorAndMealSlice";
import mealQuantitySlice from "./Slices/mealQuantitySlice";
import filterSlice from "./Slices/filterSlice";
import languageSlice from "./Slices/languageSlice";
import logoutSlice from "./Slices/logoutSlice";
import addToCartSlice from "./Slices/addToCartSlice";
import totalSavingSlice from "./Slices/totalSavingSlice";
import userProfileSlice from "./Slices/userProfileSlice";

const rootReducers = combineReducers({
    locationRadiusSlice: locationRadiusSlice,
    ventorAndMealSlice: ventorAndMealSlice,
    mealQuantitySlice: mealQuantitySlice,
    filterSlice: filterSlice,
    languageSlice: languageSlice,
    logoutSlice : logoutSlice,
    addToCartSlice : addToCartSlice,
    totalSavingSlice : totalSavingSlice,
    userProfileSlice: userProfileSlice,
});

const appReducer = (state: any, action: any) => {
    if (action.type === "UserData/account_delete") {
        state = {};
    }
    return rootReducers(state, action);
};

export type RootState = ReturnType<typeof rootReducers>;
export default appReducer;
