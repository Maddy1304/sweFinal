import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'

export const OrdersApi = createApi({
    reducerPath: 'OrdersApi',
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
    tagTypes: ['getAllOrders'],
    endpoints: (builder) => ({
        CreateOrder: builder.mutation<any, any>({
            query: (obj) => ({
                url: '/orders/create-order',
                method: 'POST',
                body: obj
            }),
            invalidatesTags: ['getAllOrders']
        }),

        getAllOrders: builder.query<any, any>({
            query: (obj) => ({
                url: `/orders/get-orders?query=${obj.query}&page=${obj.page}`,
                method: 'GET'
            }),
            providesTags: ['getAllOrders']
        }),

        DeleteOrder: builder.mutation<any, any>({
            query: (obj) => ({
                url: `/orders/delete/${obj}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['getAllOrders']
        }),

        getInvoiceById: builder.query<any, any>({
            query: (obj) => ({
                url: `/orders/get-invoice/${obj}`,
                method: 'GET'
            })
        })
    }),
})

export const { 
    useCreateOrderMutation,
    useGetAllOrdersQuery,
    useDeleteOrderMutation,
    useGetInvoiceByIdQuery
} = OrdersApi