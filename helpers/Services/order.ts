import { APIClient } from "../api_helper";
import * as url from "../url_helper";

const api = new APIClient();

export const confirmPaymentApi = (data: any) => api.post(url.confirmPaymentApi, data);
export const getOrderByOrderIdApi = (data: any) => api.post(url.getOrderByOrderIdApi, data);
export const getServiceProviderOrderItems = (data: any) => api.post(url.getServiceProviderOrderItemsApi, data);
export const updateOrderPickStatus = (data: any) => api.post(url.updateOrderPickStatusApi, data);
export const getOrderListByUserid = (data: any) => api.post(url.getOrderListByUseridApi, data);
export const getOrderDetailsbyOrderId = (data: any) => api.post(url.getorderdetailsbyorderidApi, data);