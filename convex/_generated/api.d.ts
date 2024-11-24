/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_account from "../functions/account.js";
import type * as functions_clients from "../functions/clients.js";
import type * as functions_invoice from "../functions/invoice.js";
import type * as functions_items from "../functions/items.js";
import type * as functions_user from "../functions/user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/account": typeof functions_account;
  "functions/clients": typeof functions_clients;
  "functions/invoice": typeof functions_invoice;
  "functions/items": typeof functions_items;
  "functions/user": typeof functions_user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
