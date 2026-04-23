import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import CreateOrder from "./pages/CreateOrder";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import TimeSlotMonitor from "./pages/TimeSlotMonitor";
import BusinessListings from "./pages/BusinessListings";

import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminProductOverview from "./pages/AdminProductOverview";

export default function ProtectedLayout() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0d",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1.5px solid #ff3c3c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "var(--mono)",
          fontSize: '11px',
          color: '#ff3c3c',
          animation: 'fadeIn 0.5s ease',
        }}>
          LS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner" style={{ borderTopColor: '#555' }} />
          <span style={{
            fontFamily: "var(--mono)",
            fontSize: "12px",
            color: "#555",
            letterSpacing: "0.1em"
          }}>
            loading_
          </span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role detection: profiles table is the source of truth.
  // Fallback to user_metadata.role for the brief window between signup and trigger execution.
  const userRole = profile?.role || user?.user_metadata?.role || 'customer';
  const isAdmin = userRole === "admin";
  const isBusiness = userRole === "business";
  const isCustomer = !isAdmin && !isBusiness;
  const businessId = isBusiness ? (profile?.business_id || profile?.id?.slice(0, 8) || user.id?.slice(0, 8)) : null;
  const userName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0];
  const defaultPage = isAdmin ? "admin" : "products";

  return (
    <div style={{ display: "flex", background: "#0d0d0d", minHeight: "100vh" }}>
      <Sidebar
        isAdmin={isAdmin}
        isBusiness={isBusiness}
        businessId={businessId}
        onSignOut={signOut}
        userEmail={user.email}
        userName={userName}
      />

      <main style={{
        flex: 1,
        padding: "32px 36px",
        overflow: "auto",
        minWidth: 0,
      }}>
        <Routes>

          {/* Default redirect — customers go to products, admins go to admin */}
          <Route path="/" element={<Navigate to={defaultPage} />} />

          {/* USER — dashboard only for admin/business */}
          <Route path="/dashboard" element={isCustomer ? <Navigate to="products" replace /> : <Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />

          {/* BUSINESS */}
          {isBusiness && <Route path="/business-listings" element={<BusinessListings />} />}

          {/* ADMIN */}
          {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
          {isAdmin && <Route path="/admin/overview" element={<AdminProductOverview />} />}
          {isAdmin && <Route path="/admin/orders" element={<AdminOrders />} />}
          {isAdmin && <Route path="/admin/products" element={<AdminProducts />} />}
          {isAdmin && <Route path="/admin/slots" element={<TimeSlotMonitor />} />}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="dashboard" />} />

        </Routes>
      </main>
    </div>
  );
}