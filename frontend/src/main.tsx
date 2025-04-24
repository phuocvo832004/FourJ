import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './store/store'
import App from './App.tsx'
import './index.css'

// Tạo Client cho React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút
      gcTime: 30 * 60 * 1000, // 30 phút (thay thế cho cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Chỉ import DevTools trong development mode
const ReactQueryDevtools = 
  import.meta.env.MODE === 'development' 
  ? React.lazy(() => 
      import('@tanstack/react-query-devtools').then(module => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : () => null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Suspense fallback={null}>
          <ReactQueryDevtools />
        </Suspense>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
