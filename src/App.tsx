import { useEffect, useState, useCallback } from 'react';
import { Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Desktop components
import NavBar from './components/global/NavBar';
import PageTransition from './components/global/PageTransition';
import LoadingScreen from './components/global/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Desktop pages
import MenuPage from './pages/MenuPage';
import TablePage from './pages/TablePage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import KitchenPage from './pages/KitchenPage';
import CustomerOrderMenu from './pages/CustomerOrderMenu';
import InvoicesPage from './pages/InvoicesPage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';

// Mobile pages
import MobileMenuPage from './pages/mobile/MobileMenuPage';
import MobileOrdersPage from './pages/mobile/MobileOrdersPage';
import MobileTablePage from './pages/mobile/MobileTablePage';
import MobileProductsPage from './pages/mobile/MobileProductsPage';
import MobileInvoicesPage from './pages/mobile/MobileInvoicesPage';
import MobileKitchenPage from './pages/mobile/MobileKitchenPage';
import MobileUserManagementPage from './pages/mobile/MobileUserManagementPage';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeName, useTheme } from './context/ThemeContext';
import useResponsiveStage from './utils/useResponsiveStage';
import MobileNavBar from './components/global/MobileNavBar';

/**
 * Main application component that sets up the routing and layout structure.
 * Handles the responsive navigation and page transitions.
 */
function App() {
	const [hiddenMenu, setHiddenMenu] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const { } = useResponsiveStage(800, 800);

	// Function to detect if device is mobile
	const detectMobile = useCallback(() => {
		const userAgent = navigator.userAgent.toLowerCase();
		const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
		const isSmallScreen = window.innerWidth <= 768;
		return mobileRegex.test(userAgent) || isSmallScreen;
	}, []);

	// Set theme from local storage
	useEffect(() => {
		const setDefaultTheme = () => {
			const theme = localStorage.getItem('theme') as ThemeName | null;
			if (theme) {
				setTheme(theme);
			} else {
				setTheme('vintageGarnet');
			}
		}
		setDefaultTheme();
	}, [setTheme]);
	
	// Detect mobile device and setup auto-redirect logic
	useEffect(() => {
		// Detect if user is on mobile device
		const mobile = detectMobile();
		setIsMobile(mobile);
		
		// Handle redirection based on device type and current path
		const currentPath = location.pathname;
		
		// Skip redirection for login pages and customer menu
		if (currentPath === '/manager' || currentPath.startsWith('/menu/table/')) {
			return;
		}
		
		// Redirect mobile users to mobile routes if they're on desktop routes
		if (mobile && currentPath.includes('/manager/') && !currentPath.includes('/m/manager/')) {
			const mobilePath = currentPath.replace('/manager/', '/m/manager/');
			navigate(mobilePath, { replace: true });
		}
		
		// Redirect desktop users to desktop routes if they're on mobile routes
		if (!mobile && currentPath.includes('/m/manager/')) {
			const desktopPath = currentPath.replace('/m/manager/', '/manager/');
			navigate(desktopPath, { replace: true });
		}
	}, [location.pathname, detectMobile, navigate]);


	// Add a resize listener to update isMobile state when window size changes
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(detectMobile());
		};
		
		// Initial check
		handleResize();
		
		// Add event listener
		window.addEventListener('resize', handleResize);
		
		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [detectMobile]);

	return (
		<AuthProvider>
			<AnimatePresence mode="wait">
				<motion.div
					className="w-full h-full flex relative overflow-hidden"
					animate={hiddenMenu ? { width: 'calc(100dvw + 200px)' } : { width: '100dvw' }}
					transition={{ type: 'spring', stiffness: 350, damping: 30 }}
				>
					{/* Only show navbar for desktop routes, not on login or mobile paths */}
					{!isMobile && location.pathname.includes('manager') && location.pathname !== '/manager' && !location.pathname.includes('/m/') && (
						<NavBar hidden={hiddenMenu} setHidden={setHiddenMenu} />
					)}
					<motion.div
						className="flex-grow relative"
						initial={{ opacity: 0.95 }}
						animate={(!isMobile && hiddenMenu) ?
							{ x: -200, y: 0, opacity: 1 } :
							{ x: 0, y: 0, opacity: 1 }
						}
						transition={{ type: 'spring', stiffness: 350, damping: 30 }}
					>
						<Routes location={location} key={location.pathname}>
							{/* Public routes */}
							<Route path="/manager" element={<PageTransition><LoginPage /></PageTransition>} />
							<Route path="/menu/table/:tableId" element={<PageTransition><CustomerOrderMenu /></PageTransition>} />

							{/* Desktop Protected manager routes */}
							<Route element={<ProtectedRoute requiredRole={["ADMIN", "MANAGER", "WORKER"]} />}>
								<Route path="/manager/*" element={<Navigate to="/manager" replace />} />
								<Route path="/manager/menu" element={<PageTransition><MenuPage /></PageTransition>} />
								<Route path="/loading" element={<PageTransition><LoadingScreen /></PageTransition>} />
								<Route path="/manager/tables" element={<PageTransition><TablePage /></PageTransition>} />
								<Route path="/manager/products" element={<PageTransition><ProductsPage /></PageTransition>} />
								<Route path="/manager/orders" element={<PageTransition><OrdersPage /></PageTransition>} />
								<Route path="/manager/invoices" element={<PageTransition><InvoicesPage /></PageTransition>} />
								<Route path="/manager/kitchen" element={<PageTransition><KitchenPage /></PageTransition>} />
							</Route>

							{/* Desktop Admin-only routes */}
							<Route element={<ProtectedRoute requiredRole={["ADMIN"]} />}>
								<Route path="/manager/users" element={<PageTransition><UserManagementPage /></PageTransition>} />
							</Route>							
							
							{/* Mobile Protected manager routes */}
							<Route element={<ProtectedRoute requiredRole={["ADMIN", "MANAGER", "WORKER"]} />}>
								<Route path="/m/manager/menu" element={<PageTransition><MobileMenuPage /></PageTransition>} />
								<Route path="/m/manager/orders" element={<PageTransition><MobileOrdersPage /></PageTransition>} />
								<Route path="/m/manager/tables" element={<PageTransition><MobileTablePage /></PageTransition>} />
								<Route path="/m/manager/products" element={<PageTransition><MobileProductsPage /></PageTransition>} />
								<Route path="/m/manager/invoices" element={<PageTransition><MobileInvoicesPage /></PageTransition>} />
								<Route path="/m/manager/kitchen" element={<PageTransition><MobileKitchenPage /></PageTransition>} />
							</Route>

							{/* Mobile Admin-only routes */}
							<Route element={<ProtectedRoute requiredRole={["ADMIN"]} />}>
								<Route path="/m/manager/users" element={<PageTransition><MobileUserManagementPage /></PageTransition>} />
							</Route>

							<Route
								path="*"
								element={
									location.pathname.includes("manager") ? (
										<Navigate to="/manager" replace />
									) : (
										<Navigate to="/menu/table/show" replace />
									)
								}
							/>
						</Routes>
					</motion.div>
					
					{/* Navigation */}
					{location.pathname.includes('/m/') && (
						<MobileNavBar />
					)}
				</motion.div>
			</AnimatePresence>
		</AuthProvider>
	);
}

export default App;
