import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsData, AuthToken, DashboardStats, ErrorResponse, HealthStatus, LoginInput, PublicStats, RegisterInput, ShortUrl, UrlInput, UrlUpdate } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthToken>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login user
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthToken>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login user
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getListUrlsUrl: () => string;
/**
 * @summary List all URLs for the authenticated user
 */
export declare const listUrls: (options?: RequestInit) => Promise<ShortUrl[]>;
export declare const getListUrlsQueryKey: () => readonly ["/api/urls"];
export declare const getListUrlsQueryOptions: <TData = Awaited<ReturnType<typeof listUrls>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUrls>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUrls>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUrlsQueryResult = NonNullable<Awaited<ReturnType<typeof listUrls>>>;
export type ListUrlsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List all URLs for the authenticated user
 */
export declare function useListUrls<TData = Awaited<ReturnType<typeof listUrls>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUrls>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUrlUrl: () => string;
/**
 * @summary Create a short URL
 */
export declare const createUrl: (urlInput: UrlInput, options?: RequestInit) => Promise<ShortUrl>;
export declare const getCreateUrlMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUrl>>, TError, {
        data: BodyType<UrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUrl>>, TError, {
    data: BodyType<UrlInput>;
}, TContext>;
export type CreateUrlMutationResult = NonNullable<Awaited<ReturnType<typeof createUrl>>>;
export type CreateUrlMutationBody = BodyType<UrlInput>;
export type CreateUrlMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a short URL
*/
export declare const useCreateUrl: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUrl>>, TError, {
        data: BodyType<UrlInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUrl>>, TError, {
    data: BodyType<UrlInput>;
}, TContext>;
export declare const getUpdateUrlUrl: (id: number) => string;
/**
 * @summary Update a short URL destination
 */
export declare const updateUrl: (id: number, urlUpdate: UrlUpdate, options?: RequestInit) => Promise<ShortUrl>;
export declare const getUpdateUrlMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUrl>>, TError, {
        id: number;
        data: BodyType<UrlUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUrl>>, TError, {
    id: number;
    data: BodyType<UrlUpdate>;
}, TContext>;
export type UpdateUrlMutationResult = NonNullable<Awaited<ReturnType<typeof updateUrl>>>;
export type UpdateUrlMutationBody = BodyType<UrlUpdate>;
export type UpdateUrlMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update a short URL destination
*/
export declare const useUpdateUrl: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUrl>>, TError, {
        id: number;
        data: BodyType<UrlUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUrl>>, TError, {
    id: number;
    data: BodyType<UrlUpdate>;
}, TContext>;
export declare const getDeleteUrlUrl: (id: number) => string;
/**
 * @summary Delete a short URL
 */
export declare const deleteUrl: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteUrlMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUrl>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUrl>>, TError, {
    id: number;
}, TContext>;
export type DeleteUrlMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUrl>>>;
export type DeleteUrlMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a short URL
*/
export declare const useDeleteUrl: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUrl>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUrl>>, TError, {
    id: number;
}, TContext>;
export declare const getGetUrlAnalyticsUrl: (id: number) => string;
/**
 * @summary Get analytics for a specific URL
 */
export declare const getUrlAnalytics: (id: number, options?: RequestInit) => Promise<AnalyticsData>;
export declare const getGetUrlAnalyticsQueryKey: (id: number) => readonly [`/api/urls/${number}/analytics`];
export declare const getGetUrlAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getUrlAnalytics>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUrlAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUrlAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUrlAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getUrlAnalytics>>>;
export type GetUrlAnalyticsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get analytics for a specific URL
 */
export declare function useGetUrlAnalytics<TData = Awaited<ReturnType<typeof getUrlAnalytics>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUrlAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPublicStatsUrl: (shortCode: string) => string;
/**
 * @summary Get public stats for a short URL
 */
export declare const getPublicStats: (shortCode: string, options?: RequestInit) => Promise<PublicStats>;
export declare const getGetPublicStatsQueryKey: (shortCode: string) => readonly [`/api/stats/${string}`];
export declare const getGetPublicStatsQueryOptions: <TData = Awaited<ReturnType<typeof getPublicStats>>, TError = ErrorType<ErrorResponse>>(shortCode: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicStats>>>;
export type GetPublicStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get public stats for a short URL
 */
export declare function useGetPublicStats<TData = Awaited<ReturnType<typeof getPublicStats>>, TError = ErrorType<ErrorResponse>>(shortCode: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get dashboard summary statistics
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get dashboard summary statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map