// src/routes/index.js - Centralized route exports
export { default as AuthRoutes } from './authRoutes';
export { default as SuratPengantarRoutes } from './suratPengantarRoutes';
export { default as ManagementRoutes } from './managementRoutes';
export { default as AdminRoutes } from './adminRoutes';
export { default as DashboardRoutes } from './dashboardRoutes';
export { default as PublicRoutes } from './publicRoutes';

// Route groups documentation:
// - AuthRoutes: Login, register, profile completion
// - SuratPengantarRoutes: User-level surat pengantar operations
// - ManagementRoutes: RT and RW management dashboards
// - AdminRoutes: Admin and super admin functionality
// - DashboardRoutes: Main dashboard and quick access routes
// - PublicRoutes: Public pages, errors, and landing