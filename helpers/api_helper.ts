import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  CancelTokenSource,
  AxiosHeaders,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

/**
 * 🌍 Base configuration
 */
axios.defaults.baseURL = config.API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["tenant"] = "root";

/**
 * 🧩 Cancel Token setup
 */
let sourceRequest: Record<string, { cancel: () => void }> = {};
let cancelToken: CancelTokenSource | undefined;

if (cancelToken) cancelToken.cancel("Operation canceled due to new request.");
cancelToken = axios.CancelToken.source();

/**
 * ✅ REQUEST INTERCEPTOR
 * Inject bearer token into request headers
 */
axios.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {    
    try {
      const tokenValue = await AsyncStorage.getItem("userData");
      const token =  tokenValue ? JSON.parse(tokenValue) : null;
      
      const tokenData = token;
      // console.log(JSON.stringify(tokenData.token));

      const headers = new AxiosHeaders(reqConfig.headers || {});
      if (tokenData?.token) {
        headers.set("Authorization", `Bearer ${tokenData.token}`);
      }

      reqConfig.headers = headers;

      // ✅ Assign Cancel Token
      const axiosSource = axios.CancelToken.source();
      if (reqConfig.url) {
        sourceRequest[reqConfig.url] = { cancel: axiosSource.cancel };
        reqConfig.cancelToken = axiosSource.token;
      }

      return reqConfig;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return reqConfig;
    }
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * ✅ RESPONSE INTERCEPTOR
 * Unified error handling
 */
axios.interceptors.response.use(
  (response: AxiosResponse) => (response.data ? response.data : response),
  (error: AxiosError) => {
    let message = "Something went wrong.";

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = "Wrong email or user not registered.";
          break;
        case 404:
          message = "Sorry! The data you are looking for could not be found.";
          break;
        case 500:
          message = "Internal Server Error.";
          break;
        default:
          message = error.message || "Unexpected network error.";
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(message);
  }
);

/**
 * ✅ Manually set Authorization header
 */
export const setAuthorization = (token: string): void => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

/**
 * ✅ APIClient class with proper generics
 */
export class APIClient {
  get<T = any>(url: string, params?: AxiosRequestConfig): Promise<T> {
    return axios.get<T>(url, params).then((res) => res as T);
  }

  create<T = any>(url: string, data?: any): Promise<T> {
    return axios.post<T>(url, data).then((res) => res as T);
  }

  post<T = any>(url: string, data?: any): Promise<T> {
    return axios.post<T>(url, data).then((res) => res as T);
  }

  update<T = any>(url: string, data?: any): Promise<T> {
    return axios.put<T>(url, data).then((res) => res as T);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axios.delete<T>(url, config).then((res) => res as T);
  }
}

/**
 * ✅ Example placeholder
 */
export const getLoggedinUser = (): any | null => {
  const user = null;
  if (!user) return null;
  return JSON.parse(user);
};