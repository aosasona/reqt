import apisauce from "apisauce";
import { CustomApiResponse } from "./types/requests";
import { HTTPException, getErrorMessage, unwrapHTTPError } from "./error";
import { mockAuthStore as useAuthStore, mockToast as toast } from "./mock";

type RefreshTokenResponse = CustomApiResponse<{ value: string }>; // could be anything else

type DataLoaderArgs<T extends object | Array<T> | null, U extends T> = {
	endpoint: `/${string}`;
	default: U;
};

// replace this with your own api url
const API_URL = "/api";

const api = apisauce.create({
	baseURL: API_URL,
	timeout: 30000,
	withCredentials: true,
});

const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-out", "/auth/refresh-token"];
api.addAsyncResponseTransform(async function(response) {
	try {
		if (AUTH_ROUTES.includes(response.config?.url || "")) return;

		// if the request fails bevause of an expired token, try to refresh it
		if (response.status == 401 || response.status == 403) {
			const res = await api.post<RefreshTokenResponse>("/auth/refresh-token", {});

			// if we get a new token and we have the data we need to make a new request, try to resend the request and replace the response
			if (res.data?.ok && res?.data?.data?.value && response.config?.url && response.config?.method) {
				response = await api.any({
					url: response?.config?.url,
					method: response?.config?.method,
					headers: { ...response?.config?.headers, Authorization: `Bearer ${res.data?.data?.value}` },
					data: response?.config?.data,
				});
			}
		}
	} catch (e) {
		if (useAuthStore.getState().isSignedIn) useAuthStore.getState().signOut();
	}
});

async function load<T extends object, U extends T>(args: DataLoaderArgs<T, U>): Promise<T> {
	try {
		const response = await api.get<CustomApiResponse<T>>(args.endpoint);
		const { error } = unwrapHTTPError(response.data);
		if (error) {
			throw new HTTPException(error);
		}
		return response?.data?.data || args.default;
	} catch (e) {
		toast.error(getErrorMessage(e));
		return args.default;
	}
}

export { api, load, API_URL };
