export type AuthStackParamList = {
  LoginScreen: undefined;
  ForgotPassword: undefined;
  RegistrationScreen: undefined;
  OtpScreen: { phoneNumber: string, routeId: number, user_id: string };
  LocationScreen: undefined;
  CreatePassword: { email: string; otp: string[] };
  AppNavigation: undefined;
  TabNavigation: undefined;
}