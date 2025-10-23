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
import type * as auth from "../auth.js";
import type * as bankPdc from "../bankPdc.js";
import type * as businessInHand from "../businessInHand.js";
import type * as cashflow from "../cashflow.js";
import type * as currency from "../currency.js";
import type * as dashboard from "../dashboard.js";
import type * as expenses from "../expenses.js";
import type * as futureNeeds from "../futureNeeds.js";
import type * as http from "../http.js";
import type * as liabilities from "../liabilities.js";
import type * as lib_internal_schema from "../lib/internal_schema.js";
import type * as lib_roles from "../lib/roles.js";
import type * as rebolt from "../rebolt.js";
import type * as router from "../router.js";
import type * as salaries from "../salaries.js";
import type * as sales from "../sales.js";
import type * as seedData from "../seedData.js";
import type * as seedData_old from "../seedData_old.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bankPdc: typeof bankPdc;
  businessInHand: typeof businessInHand;
  cashflow: typeof cashflow;
  currency: typeof currency;
  dashboard: typeof dashboard;
  expenses: typeof expenses;
  futureNeeds: typeof futureNeeds;
  http: typeof http;
  liabilities: typeof liabilities;
  "lib/internal_schema": typeof lib_internal_schema;
  "lib/roles": typeof lib_roles;
  rebolt: typeof rebolt;
  router: typeof router;
  salaries: typeof salaries;
  sales: typeof sales;
  seedData: typeof seedData;
  seedData_old: typeof seedData_old;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
