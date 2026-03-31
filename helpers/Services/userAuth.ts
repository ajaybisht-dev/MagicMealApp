import { APIClient } from "../api_helper";
import * as url from "../url_helper";
import { ApiResponse } from "../../src/types/Api";

const api = new APIClient();

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  userRole: string;
  userDeviceToken?: string;
  userDeviceType: string;
  ipAddress?: string;
}

export const userRegistration = (data: RegisterUserData) =>
  api.post<ApiResponse>(url.userRegistrationApi, data);

export const confirmEmailOtp = (data: any) =>
  api.post<ApiResponse>(url.confirmEmailOtpApi, data);

export const resendOtp = (data: any) =>
  api.post<ApiResponse>(url.resendOtpApi, data);

export const userLocation = (data: any) =>
  api.post<ApiResponse>(url.insertUpdateUserLocationApi, data);

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: string;
  userID: string;
  fullName: string;
  userEmail: string;
  userRole: string;
  isSystemPassword: boolean;
  ipAddress?: string;
  image_url?: string;
  tenant?: string;
}

export const getUserLoginToken = (data: LoginPayload) =>
  api.post<LoginResponse>(url.userLoginApi, data);

/**
 * PASSWORD MANAGEMENT
 */
export const userForgotPassword = (data: { email: string }) =>
  api.post<ApiResponse>(url.userForgotPasswordApi, data);

export const userResetPassword = (data: any) =>
  api.post<ApiResponse>(url.resetPasswordApi, data);
