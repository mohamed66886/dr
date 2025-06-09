import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Appointment from "./pages/Appointment";
import Testimonials from "./pages/Testimonials";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound"
import Loader from "./components/Loader";
import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import AppointmentsAdmin from "./pages/admin/AppointmentsAdmin";
import SettingsAdmin from "./pages/admin/settings"; 
import DirectExpenses from "./pages/admin/expenses-direct";
import ReportsPage from "./pages/admin/reports";
import ExpensesReportPage from "./pages/admin/expenses-report";
import FinancialYearPage from "./pages/admin/financial-year";
import AdminRoute from "./components/AdminRoute";
import ExpensesTypesSection from "./pages/admin/expenses";
import DatabaseAdmin from "./pages/admin/database";
import ProfitReportPage from "./pages/admin/profit-report";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // 1.2s for demo
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <Loader />;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              {/* صفحات الأدمن */}
              <Route path="/admin/Dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
              <Route path="/admin/services" element={<AdminRoute><ServicesAdmin /></AdminRoute>} />
              <Route path="/admin/appointments" element={<AdminRoute><AppointmentsAdmin /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SettingsAdmin /></AdminRoute>} />
              <Route path="/admin/expenses-direct" element={<AdminRoute><DirectExpenses /></AdminRoute>} />
              <Route path="/admin/expenses/direct" element={<AdminRoute><DirectExpenses /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
              <Route path="/admin/expenses-report" element={<AdminRoute><ExpensesReportPage /></AdminRoute>} />
              <Route path="/admin/expenses" element={<AdminRoute><ExpensesTypesSection /></AdminRoute>} />
              <Route path="/admin/financial-year" element={<AdminRoute><FinancialYearPage /></AdminRoute>} />
              <Route path="/admin/database" element={<AdminRoute><DatabaseAdmin /></AdminRoute>} />
              <Route path="/admin/profit-report" element={<AdminRoute><ProfitReportPage /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
