const apistartWith = 'v1';
export const POST_token = "/tokens";


// User Registration 
export const userRegistrationApi = "/users/user-register";
export const confirmEmailOtpApi = "/users/confirmemailuserotp";
export const resendOtpApi = "/users/resendemailsmsotp";
export const resetPasswordApi = "/users/reset-password";
export const getUserTotalSavingsApi = "/users/getusertotalsavings"; 
export const getallverifiedratingbyuseridApi = "/users/getallverifiedratingbyuserid"; 
export const GetVendorWiseSavingApi = "/users/getvendorwisesaving"; 
export const GetCategoryWiseSavingApi = "/users/getcategorywisesaving"; 

// User Login
export const userLoginApi = "/tokens/getusertoken";
export const userForgotPasswordApi = "/users/forgot-password"

// User Profile
export const getUserProfileApi = "/personal/profile";
export const setUserProfileApi = "/personal/profile";
export const changePasswordApi = "/personal/change-password"
export const DeactivateUserAccountApi = "/users/deactivateuseraccount"

//personal user
export const insertUpdateUserLocationApi = "/users/insertupdateuserpreference";
export const updateDeviceTokenApi = "/personal/updatedevicetoken";


// master api
export const getVendorandMealTypesApi = "/master/getvendorandmealtypes";

// surprise box api
export const getAllHotDealSurpriseBoxesApi = "/surprisebox/getallhotdealsurpriseboxes";
export const getAllActiveSurpriseBoxesByCustomerIdApi = "/surprisebox/getallactivesurpriseboxesbycustomerid";
export const getSurpriseBoxDetailsByIdApi = "/surprisebox/getsurpriseboxbyid";
export const getAllActiveSurpriseBoxesBySPIdApi = "/surprisebox/getallactivesurpriseboxesbyspid"; 
export const getsurpriseboxratingandreviewsApi = "/surprisebox/getserviceproviderratingandreviews"; 
export const submitServiceProviderRatingApi = "/surprisebox/submitserviceproviderrating";  
export const getServiceProviderRatingAndReviewsApi = "/surprisebox/getserviceproviderratingandreviews";

// cart api 

export const insertUpdateCartApi = "/cart/insertupdatecart";
export const checkoutApi = "/cart/checkout";
export const getcartbyuseridApi = "/cart/getcartbyuserid";

// order api 
export const confirmPaymentApi = "/order/confirmpayment";
export const getOrderByOrderIdApi = "/order/getorderbyorderid";
export const getServiceProviderOrderItemsApi = "/order/getserviceproviderorderitems";
export const updateOrderPickStatusApi = "/order/updateorderpickstatus";
export const getOrderListByUseridApi = "/order/getorderlistbyuserid";
export const getorderdetailsbyorderidApi = "/order/getorderdetailsbyorderid"