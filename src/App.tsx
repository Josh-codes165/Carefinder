// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Home from "./pages/Home";
// import Search from "./pages/Search";
// import HospitalDetail from "../src/pages/HospitalDetail";
// import Login from "../src/pages/login";
// import AdminDashboard from "../src/pages/Dashboard";
// import ProtectedRoute from "./Components/ProtectedRoute";

// const queryClient = new QueryClient();

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/search" element={<Search />} />
//           <Route path="/hospital/:id" element={<HospitalDetail />} />
//           <Route path="/login" element={<Login />} />

//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute requireAdmin>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Home from "./pages/Home"
import Search from "./pages/Search"
import HospitalDetail from "./pages/HospitalDetail"
import Login from "./pages/login"
import AdminDashboard from "./pages/Dashboard"
import ProtectedRoute from "./Components/ProtectedRoute"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 401 errors — it just floods the network tab
      retry: false,
      // Wait for data to be stale before refetching
      staleTime: 30000,
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/hospital/:id" element={<HospitalDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App