import { Dispatch, SetStateAction } from "react";
import { CustomApiResponse, UnwrappedError } from "../types/requests";
import { HTTPException, AppException } from "./error";
import { mockToast as toast } from "../mock";

const APP_EXCEPTIONS = ["AppException", "HTTPException"];
const VISIBLE_CLIENT_ERRORS = [400, 402, 403, 404, 406, 408, 409, 411, 412, 415, 422, 426, 428, 429, 403, 500, 502, 503, 504, 511];

function unwrapHTTPError<T extends object = any, U extends object = T>(data?: CustomApiResponse<T> | void): UnwrappedError<U> {
	if (data?.ok) return { error: null, errors: null, errType: "none" };

	const unwrappedError: UnwrappedError<U> = { error: "Something went wrong!", errors: null, errType: "fatal" };

	if (data?.status_code == 401) {
		return {
			error: null,
			errors: null,
			errType: "access_token_expired",
		};
	}

	const isVisibleError = VISIBLE_CLIENT_ERRORS.includes(data?.status_code ?? 0);

	if (!!data && isVisibleError) {
		if (data?.errors) {
			unwrappedError.error = null;
			unwrappedError.errors = data?.errors;
			unwrappedError.errType = "validation";
		}

		if (data?.error) {
			unwrappedError.error = data?.error;
		}

		if (data?.status_code == 428) unwrappedError.errType = "verification";
		if (data?.status_code == 429) unwrappedError.errType = "rate_limit";
	}

	return unwrappedError;
}

/** @throws {AppException, HTTPException, Error} */
function handleUnwrappedError<T extends object>(unwrappedError: UnwrappedError<T>, setErrors?: Dispatch<SetStateAction<Partial<T> | null>>): void {
	const { error, errors, errType } = unwrappedError;
	if (errType == "none") return;
	if (errType == "validation" || errors != null) {
		if (setErrors) setErrors(errors as T);
	}
	if (error != null) {
		throw new HTTPException(error);
	}
}

function getErrorMessage(e: unknown) {
	const err = e as Error;
	let msg = "Oops, something went wrong";
	if (APP_EXCEPTIONS.includes(err.name)) {
		msg = err.message;
	}
	return msg;
}

function showError(e: unknown) {
	const msg = getErrorMessage(e);
	toast.error(msg);
}

export { HTTPException, AppException, getErrorMessage, unwrapHTTPError, handleUnwrappedError, showError, VISIBLE_CLIENT_ERRORS };
