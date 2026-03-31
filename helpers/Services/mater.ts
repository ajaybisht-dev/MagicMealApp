import { APIClient } from "../api_helper";
import * as url from "../url_helper";

const api = new APIClient();

export const getVendorandMealTypes = () => api.get(url.getVendorandMealTypesApi);