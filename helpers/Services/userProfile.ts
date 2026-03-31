import { APIClient } from "../api_helper";
import * as url from "../url_helper";

const api = new APIClient();

// User Profile

export const getUserProfile = () => api.get(url.getUserProfileApi);
export const setUserProfile = (data: any) => api.post(url.setUserProfileApi, data);
export const changeProfilePassword = (data: any) => api.post(url.changePasswordApi, data);
export const getUserTotalSavings = (data: any) => api.post(url.getUserTotalSavingsApi, data);
export const getAllVerifiedRatingByUserIdApi = (data: any) => api.post(url.getallverifiedratingbyuseridApi, data);
export const GetVendorWiseSaving = (data: any) => api.post(url.GetVendorWiseSavingApi, data);
export const GetCategoryWiseSaving = (data: any) => api.post(url.GetCategoryWiseSavingApi, data);
export const DeactivateUserAccount = (data: any) => api.post(url.DeactivateUserAccountApi, data);