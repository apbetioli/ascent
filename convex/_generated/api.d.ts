/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiTokens from "../apiTokens.js";
import type * as auth from "../auth.js";
import type * as boards from "../boards.js";
import type * as goals from "../goals.js";
import type * as http from "../http.js";
import type * as magicLinks from "../magicLinks.js";
import type * as pendingPayments from "../pendingPayments.js";
import type * as profiles from "../profiles.js";
import type * as records from "../records.js";
import type * as resendOTP from "../resendOTP.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  apiTokens: typeof apiTokens;
  auth: typeof auth;
  boards: typeof boards;
  goals: typeof goals;
  http: typeof http;
  magicLinks: typeof magicLinks;
  pendingPayments: typeof pendingPayments;
  profiles: typeof profiles;
  records: typeof records;
  resendOTP: typeof resendOTP;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
