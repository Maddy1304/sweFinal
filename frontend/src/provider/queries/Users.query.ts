import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'

export const UserApi = createApi({
    reducerPath: 'UserApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    tagTypes: ['getAllConsumer', 'getConsumer'],
    endpoints: (builder) => ({
        registerConsumer: builder.mutation<any,any>({
            query: (obj) => ({
                url:'/consumer/register',
                method:'POST',
                body: obj
            }),
            invalidatesTags: ['getAllConsumer']
        }),

        getAllConsumers: builder.query<any, any>({
            query: (obj) => ({
                url: `/consumer/get-all?query=${obj.query}&page=${obj.page}`,
                method: 'GET'
            }),
            providesTags: ['getAllConsumer']
        }),

        getForSearchUser: builder.query<any, any>({
            query: () => ({
                url: `/consumer/get-search`,
                method: 'GET'
            }),
            providesTags: ['getAllConsumer']
        }),

        deleteConsumer: builder.mutation<any, any>({
            query: (_id) => ({
                url: '/consumer/delete/'+_id,
                method: 'DELETE'
            }),
            invalidatesTags: ['getAllConsumer']
        }),

        getConsumers: builder.query<any, any>({
            query: (_id) => ({
                url: '/consumer/get/' + _id,
                method: 'GET'
            }),
            providesTags: ['getConsumer']
        }),

        UpdateConsumer: builder.mutation<any, any>({
            query: ({data,_id}) => ({
                url: '/consumer/update/' + _id,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['getAllConsumer','getConsumer']
        }),

        dashboardData: builder.query<any, any>({
            query: () => ({
                url: '/consumer/dashboard/',
                method: 'GET'
            })
        }),
    }),
})

export const { 
    useRegisterConsumerMutation,
    useGetAllConsumersQuery,
    useDeleteConsumerMutation,
    useGetConsumersQuery,
    useUpdateConsumerMutation,
    useGetForSearchUserQuery,
    useDashboardDataQuery
} = UserApi