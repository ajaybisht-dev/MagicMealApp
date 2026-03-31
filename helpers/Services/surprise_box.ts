import { APIClient } from "../api_helper";
import * as url from "../url_helper";

const api = new APIClient();

export const getAllHotDealSurpriseBoxes = (data: any) => api.post(url.getAllHotDealSurpriseBoxesApi, data);
export const getAllActiveSurpriseBoxesByCustomerId = (data: any) => api.post(url.getAllActiveSurpriseBoxesByCustomerIdApi, data);
export const getSurpriseBoxDetailsById = (data: any) => api.post(url.getSurpriseBoxDetailsByIdApi, data);
export const getAllActiveSurpriseBoxesBySPId = (data: any) => api.post(url.getAllActiveSurpriseBoxesBySPIdApi, data);
export const getSurpriseBoxRatingAndReviews = (data: any) => api.post(url.getsurpriseboxratingandreviewsApi, data);
export const submitServiceProviderRating = (data: any) => api.post(url.submitServiceProviderRatingApi, data);
export const getServiceProviderRatingAndReviews = (data: any) => api.post(url.getServiceProviderRatingAndReviewsApi, data);