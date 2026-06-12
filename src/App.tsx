import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Home from "./pages/Home"
import Search from "./pages/Search"
import HospitalDetail from "./pages/HospitalDetail"
import Login from "./pages/login"
import AdminDashboard from "./pages/Dashboard"
import ProtectedRoute from "./Components/ProtectedRoute"
import ErrorBoundary from "./Components/ErrorBoundary"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30000,
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary><Home /></ErrorBoundary>
          } />
          <Route path="/search" element={
            <ErrorBoundary><Search /></ErrorBoundary>
          } />
          <Route path="/hospital/:id" element={
            <ErrorBoundary><HospitalDetail /></ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary><Login /></ErrorBoundary>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <ErrorBoundary><AdminDashboard /></ErrorBoundary>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App