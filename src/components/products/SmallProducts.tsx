/**
 * SmallProducts.tsx
 * Compact grid display of products with search functionality.
 */

// React and external libraries
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Icons
import { MdInfo, MdSearch } from "react-icons/md";
import { FaUtensils } from "react-icons/fa";

// Context
import { useTheme } from '../../context/ThemeContext';

// Types
import { ProductType } from '../../types';

/**
 * Props for the SmallProducts component
 * @interface ProductProps
 */
type ProductProps = {
	/** Array of products to display, undefined when loading */
	products: ProductType[] | undefined;
	/** Optional callback function when a product is clicked */
	onProductClick?: (product: ProductType) => void;
};

/**
 * SmallProducts Component
 * 
 * A compact grid display of products with search functionality.
 * Displays product images and names in a responsive grid layout.
 * Allows filtering products by name via search input.
 *
 * @param {ProductProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const SmallProducts = ({ products, onProductClick }: ProductProps) => {
	// Theme context for styling
	const { themeColors } = useTheme();

	// State for search filtering
	const [search, setSearch] = useState("");
	// State for staggered animation of products
	const [isLoaded, setIsLoaded] = useState(false);
	
	// Trigger staggered animation once products are loaded
	useEffect(() => {
		if (products?.length) {
			setIsLoaded(true);
		}
	}, [products]);

	/**
	 * Filter products based on the search input
	 * Case-insensitive name matching
	 */
	const filteredProducts = products?.filter((product) =>
		product.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<motion.div 
			className="h-full flex flex-col justify-start items-center p-4 overflow-y-auto"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{/* Header with title */}
			<motion.div 
				className="w-full flex justify-between items-center mb-6"
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				<div className="flex items-center gap-2">
					<FaUtensils className="text-xl" style={{ color: themeColors.accent }} />
					<h2 className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text relative">
						Products
						<motion.div 
							className="absolute -bottom-1 left-0 h-0.5 rounded-full w-full" 
							style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: "100%", opacity: 0.5 }}
							transition={{ delay: 0.2, duration: 0.4 }}
						/>
					</h2>
				</div>
				<div className="text-sm" style={{ color: `${themeColors.text}80` }}>
					{filteredProducts?.length} items
				</div>
			</motion.div>

			{/* Search input for filtering products */}
			<div className="relative w-full max-w-[300px] mb-6">
				<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
					<MdSearch size={20} style={{ color: `${themeColors.text}60` }} />
				</div>
				<motion.input
					type="text"
					placeholder="Search products..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-10 py-2 pr-4 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
					initial={{ y: -10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
					style={{
						backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent})`,
						color: themeColors.text,
						borderColor: themeColors.accent,
						boxShadow: `0 4px 6px -1px ${themeColors.accent}15, 0 2px 4px -1px ${themeColors.accent}10`,
					}}
					aria-label="Search products"
				/>
			</div>
			{/* Product grid layout with staggered animation */}
			<div className="w-full flex flex-wrap gap-4 justify-center">
				{filteredProducts?.map((product, index) => (
					<motion.div
						key={product.id}
						whileHover={{ 
							scale: 1.05, 
							y: -5,
							zIndex: 1,
							boxShadow: `0 20px 25px -5px ${themeColors.secondary}25, 0 10px 10px -5px ${themeColors.secondary}15`
						}}
						whileTap={{ scale: 0.98 }}
						initial={{ opacity: 0, y: 20 }}
						animate={isLoaded ? { 
							opacity: 1, 
							y: 0,
							transition: { delay: 0.2 + (index * 0.05), duration: 0.3 }
						} : {}}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						className="group relative w-[160px] rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer overflow-hidden"
						style={{
							backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent})`,
							boxShadow: `0 4px 6px -1px ${themeColors.secondary}20, 0 2px 4px -1px ${themeColors.secondary}10`
						}}
						onClick={() => onProductClick?.(product)}
					>
						{/* Highlight overlay when hovered */}
						<motion.div 
							className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
							style={{ 
								background: `linear-gradient(135deg, ${themeColors.accent}50, ${themeColors.secondary}50)` 
							}}
						/>
						
						{product?.url ? (
							<div className="relative p-1 mb-3 rounded-lg overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-20 rounded-lg" />
								<img
									src={product.url}
									alt={product.name}
									className="w-24 h-24 object-cover rounded-lg relative z-10 shadow-md transition-transform duration-300 group-hover:scale-105"
								/>
							</div>
						) : (
							<div
								className="w-24 h-24 flex items-center justify-center rounded-lg mb-3 relative overflow-hidden"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-10" />
								<MdInfo size={32} style={{ color: themeColors.accent }} />
							</div>
						)}
						<div className="w-full h-px my-2" style={{ background: `linear-gradient(to right, transparent, ${themeColors.accent}40, transparent)` }}></div>

						<motion.h2
							className="w-full font-semibold text-ellipsis whitespace-nowrap overflow-hidden text-center group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-secondary group-hover:bg-clip-text transition-all duration-300 px-1"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 500, damping: 10 }}
						>
							{product.name}
						</motion.h2>
					</motion.div>
				))}
			</div>
			{/* Empty state when no products match the search */}
			{filteredProducts?.length === 0 && (
				<motion.div 
					className="flex flex-col items-center justify-center p-10 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					style={{ color: `${themeColors.text}80` }}
				>
					<div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-accent to-secondary opacity-10 flex items-center justify-center">
						<MdSearch className="h-8 w-8" />
					</div>
					<p className="font-medium text-lg">No products found</p>
					<p className="mt-2">Try adjusting your search or check if the product exists</p>
				</motion.div>
			)}
		</motion.div>
	);
};

export default SmallProducts;
