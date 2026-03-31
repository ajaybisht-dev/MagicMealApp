import { APIClient } from "../api_helper";
import * as url from "../url_helper";

const api = new APIClient();

export const insertUpdateCart = (data: any) => api.post(url.insertUpdateCartApi, data);
export const getCartByUserId = (data: any) => api.post(url.getcartbyuseridApi, data);
export const checkOut = (data: any) => api.post(url.checkoutApi, data);  