import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MdAdd, MdDelete, MdInfo, MdRemove, MdRestaurantMenu } from "react-icons/md";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import type { MenuType, OrderItemType, OrderType } from "../../types";

/**
 * Props for the CustomerMenu component
 * @interface MenuProps
 */
type MenuProps = {
    /** Menu data to display */
    menu: MenuType;
    /** Current order data (optional) */
    order?: OrderType;
    /** Callback function to update the order (optional) */
    updateOrder?: (order: OrderType) => void;
};

/**
 * CustomerMenu Component
 * 
 * Customer-facing menu interface that displays food categories and items.  
 * Provides functionality to view food details and add/remove items from an order.
 * Supports animated transitions and responsive design.  
 *
 * @param {MenuProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const Menu = ({ menu, order, updateOrder }: MenuProps) => {
    // Theme and state setup
    const { themeColors } = useTheme();
    const [sortedMenu, setSortedMenu] = useState<MenuType>();
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const categoryRefs = useRef<{[key: number]: HTMLDivElement}>({});

    /**
     * Sort menu categories and items by their menuOrder
     * Sets the first category as active by default
     */
    useEffect(() => {
        const sortedCategories = menu?.categories
            .sort((a, b) => a.menuOrder - b.menuOrder)
            .map((category) => ({
                ...category,
                menuItems: category.menuItems.sort(
                    (a, b) => a.menuOrder - b.menuOrder
                ),
            }));
        
        setSortedMenu(
            menu
                ? {
                    ...menu,
                    categories: sortedCategories || [],
                }
                : undefined
        );
        
        // Set the first category as active by default
        if (sortedCategories && sortedCategories.length > 0) {
            setActiveCategory(sortedCategories[0].id);
        }
    }, [menu]);

    /**
     * Get the quantity of a menu item in the current order
     * 
     * @param {number} itemId - The ID of the menu item
     * @returns {number} The quantity of the item in the order, or 0 if not present
     */
    const getItemQuantity = (itemId: number) => {
        return order?.orderItems.find(oi => oi.menuItem.id === itemId)?.quantity || 0;
    };

    /**
     * Handle changing the quantity of a menu item in the order
     * Adds new items, updates quantities, or removes items if quantity becomes zero
     * 
     * @param {number} menuItemId - The ID of the menu item
     * @param {number} change - The amount to change the quantity by (positive or negative)
     */
    const handleQuantityChange = (menuItemId: number, change: number) => {
        if (!order || !updateOrder) return;

        const existingItem = order.orderItems.find(oi => oi.menuItem.id === menuItemId);
        const menuItem = sortedMenu?.categories
            .flatMap(c => c.menuItems)
            .find(mi => mi.id === menuItemId);

        if (!menuItem) return;

        const newOrder = { ...order };

        if (existingItem) {
            const newQuantity = existingItem.quantity + change;
            if (newQuantity <= 0) {
                // Remove item if quantity is zero or negative
                newOrder.orderItems = order.orderItems.filter(oi => oi.menuItem.id !== menuItemId);
            } else {
                // Update quantity of existing item
                newOrder.orderItems = order.orderItems.map(oi =>
                    oi.menuItem.id === menuItemId ? { ...oi, quantity: newQuantity } : oi
                );
            }
        } else if (change > 0) {
            // Add new item to order
            const newOrderItem: OrderItemType = {
                id: 0,
                quantity: 1,
                price: menuItem.price,
                tax: menuItem.tax,
                note: "",
                status: "",
                menuItem: menuItem,
                completed: false
            }
            newOrder.orderItems = [
                ...order.orderItems,
                newOrderItem
            ];
        }

        updateOrder(newOrder);
    };

    return (
        <motion.div 
            className="h-full w-full p-5 md:p-6 rounded-xl overflow-x-hidden bg-opacity-95 shadow-sm" 
            style={{ backgroundColor: themeColors.background, color: themeColors.text }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <motion.div
                className="mb-6 rounded-2xl p-6 relative overflow-hidden shadow-md backdrop-blur-sm border border-opacity-20"
                style={{ 
                    background: `linear-gradient(145deg, ${themeColors.background}, color-mix(in srgb, ${themeColors.secondary} 10%, ${themeColors.background}))`,
                    borderColor: themeColors.accent
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* Decorative background element */}
                <div 
                    className="absolute -top-16 -right-16 h-48 w-48 opacity-5 rounded-full blur-xl"
                    style={{
                        background: `radial-gradient(circle at center, ${themeColors.accent}, transparent 70%)`
                    }}
                />
                
                <div className="flex items-center gap-3 justify-center">
                    <MdRestaurantMenu className="text-3xl md:text-4xl mr-2 opacity-90" style={{ color: themeColors.accent }} />
                    <h1 
                        className="font-bold text-4xl md:text-5xl tracking-tight" 
                        style={{ 
                            color: themeColors.accent
                        }}
                    >
                        {menu?.name || "Menu"}
                    </h1>
                </div>
                
                <div className="w-full flex items-center my-5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" 
                        style={{ backgroundColor: themeColors.text }}
                    />
                </div>
                
                <p className="text-base md:text-lg text-center leading-relaxed italic opacity-80" 
                   style={{ 
                       color: themeColors.text
                   }}>
                    {menu?.description || "Discover our delicious options below!"}
                </p>
            </motion.div>

            {/* Horizontal scrolling category navigation bar */}
            {sortedMenu?.categories && sortedMenu.categories.length > 0 && (
                <div 
                    className="mb-6 relative w-full"
                >
                    <div 
                        className="flex gap-2 pb-2 pt-1 px-1 overflow-x-auto scrollbar-hide mask-edges"
                    >
                        {sortedMenu.categories.map((category, index) => (
                            <motion.button
                                key={category.id}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium flex-shrink-0 transition-all duration-200 ease-in-out shadow-sm`}
                                style={{
                                    backgroundColor: activeCategory === category.id
                                        ? `color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background})` 
                                        : `color-mix(in srgb, ${themeColors.primary} 5%, ${themeColors.background})`,
                                    color: activeCategory === category.id ? themeColors.accent : themeColors.primary,
                                    borderBottom: activeCategory === category.id ? `2px solid ${themeColors.accent}` : `2px solid transparent`
                                }}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    if (categoryRefs.current[category.id]) {
                                        categoryRefs.current[category.id].scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'start'
                                        });
                                    }
                                }}
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                {category.name}
                            </motion.button>
                        ))}
                    </div>
                    {/* Add gradient masks for horizontal scroll indication */}
                    <div className="absolute top-0 left-0 h-full w-8 pointer-events-none bg-gradient-to-r from-background to-transparent opacity-50" />
                    <div className="absolute top-0 right-0 h-full w-8 pointer-events-none bg-gradient-to-l from-background to-transparent opacity-50" />
                </div>
            )}

            <div className="space-y-8 pb-20">
                {sortedMenu?.categories?.map((category, categoryIndex) => (
                    <motion.div 
                        key={category.id} 
                        className="bg-white/5 dark:bg-black/5 backdrop-blur-sm rounded-2xl mb-6 overflow-hidden border border-opacity-10 shadow-sm" 
                        style={{ 
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.secondary})`, 
                            color: themeColors.text,
                            borderColor: `color-mix(in srgb, ${themeColors.accent} 30%, transparent)`,
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 25,
                            delay: categoryIndex * 0.1 
                        }}
                        ref={el => {
                            if (el) categoryRefs.current[category.id] = el;
                        }}
                    >
                        {category.name !== "No category" && (
                            <div className="p-4 border-b border-opacity-10 bg-opacity-30" 
                                style={{
                                    borderColor: `color-mix(in srgb, ${themeColors.primary} 20%, ${themeColors.background})`,
                                    background: `linear-gradient(to right, color-mix(in srgb, ${themeColors.primary} 8%, ${themeColors.background}), ${themeColors.background})`
                                }}>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight" 
                                        style={{
                                            color: themeColors.primary
                                        }}>
                                        {category.name}
                                    </h3>
                                </div>
                            </div>
                        )}

                        <div className="p-3 md:p-4 grid gap-4">
                            {category.menuItems.filter(item => item.available).map((item, itemIndex) => (
                                <motion.div 
                                    key={item.id} 
                                    className="rounded-xl p-5 relative overflow-hidden bg-opacity-40 backdrop-blur-[1px] border border-opacity-10" 
                                    style={{ 
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 98%, ${themeColors.accent})`,
                                        borderColor: themeColors.accent,
                                        boxShadow: `0 4px 20px -8px ${themeColors.accent}25`,
                                        transition: "all 0.3s ease"
                                    }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.05 * itemIndex }}
                                    whileHover={{ 
                                        scale: 1.01,
                                        boxShadow: `0 6px 25px -5px ${themeColors.accent}30`
                                    }}
                                >
                                    {/* Subtle background decoration */}
                                    <div
                                        className="absolute -top-6 -right-6 w-36 h-36 opacity-5 rounded-full blur-xl"
                                        style={{
                                            background: `radial-gradient(circle at top right, ${themeColors.accent}, transparent 70%)`
                                        }}
                                    />
                                    
                                    <div className="flex justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                {item.product?.url ? (
                                                    <img
                                                        src={item.product.url}
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                                                    />
                                                ) : (
                                                    <div 
                                                        className="w-14 h-14 flex items-center justify-center rounded-lg shadow-sm bg-opacity-80" 
                                                        style={{ backgroundColor: `color-mix(in srgb, ${themeColors.accent} 10%, ${themeColors.background})` }}
                                                    >
                                                        <MdInfo size={22} style={{ color: themeColors.accent }} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                                        <h4 className="text-base font-medium" style={{ 
                                                            color: themeColors.primary
                                                        }}>
                                                            {item.product?.name}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.product?.allergens?.map((allergen, index) => (
                                                                <motion.img
                                                                    key={index}
                                                                    src={`/allergens/${allergen.toLowerCase()}.svg`}
                                                                    alt={allergen}
                                                                    className="w-5 h-5 md:w-6 md:h-6 object-contain filter drop-shadow-sm"
                                                                    title={allergen}
                                                                    whileHover={{ scale: 1.2 }}
                                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: 0.05 * index }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p 
                                                        className="text-sm line-clamp-2 opacity-80" 
                                                        style={{ 
                                                            color: themeColors.text
                                                        }}
                                                    >
                                                        {item.product?.description || ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-opacity-20" 
                                        style={{ borderColor: `color-mix(in srgb, ${themeColors.secondary} 20%, ${themeColors.background})` }}
                                    >
                                        <div className="flex items-end gap-2">
                                            <span className="text-lg font-semibold tracking-tight"
                                                style={{ color: themeColors.accent }}
                                            >
                                                {item.price.toFixed(2)} €
                                            </span>
                                            {getItemQuantity(item.id) > 0 && (
                                                <span className="text-sm opacity-80" 
                                                   style={{ color: themeColors.text }}>
                                                    Total: {(getItemQuantity(item.id) * item.price).toFixed(2)} €
                                                </span>
                                            )}
                                        </div>
                                        
                                        {order && updateOrder && (
                                            <div className="flex items-center gap-2">
                                                <AnimatePresence>
                                                    {getItemQuantity(item.id) > 0 && (
                                                        <>
                                                            <motion.button
                                                                className="p-1.5 rounded-full shadow-sm hover:shadow flex items-center justify-center transition-all"
                                                                style={{ 
                                                                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                                    color: "#ef4444"
                                                                }}
                                                                onClick={() => handleQuantityChange(item.id, -getItemQuantity(item.id))}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <MdDelete size={18} />
                                                            </motion.button>

                                                            <motion.button
                                                                className="p-1.5 rounded-full shadow-sm hover:shadow flex items-center justify-center bg-opacity-10 transition-all"
                                                                style={{ 
                                                                    backgroundColor: `color-mix(in srgb, ${themeColors.secondary} 20%, ${themeColors.background})`
                                                                }}
                                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                                disabled={getItemQuantity(item.id) === 0}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <MdRemove size={18} className={getItemQuantity(item.id) === 0 ? "opacity-50" : ""} />
                                                            </motion.button>

                                                            <motion.span 
                                                                className="w-6 text-center font-medium text-sm"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                            >
                                                                {getItemQuantity(item.id)}
                                                            </motion.span>
                                                        </>
                                                    )}

                                                    <motion.button
                                                        className="p-1.5 rounded-full shadow-sm hover:shadow flex items-center justify-center transition-all"
                                                        style={{ 
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background})`,
                                                            color: themeColors.accent
                                                        }}
                                                        onClick={() => handleQuantityChange(item.id, 1)}
                                                        initial={getItemQuantity(item.id) ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <MdAdd size={18} />
                                                    </motion.button>
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// Add a custom CSS class to hide scrollbars but maintain functionality
const styleElement = document.createElement('style');
styleElement.textContent = `
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
}
`;
document.head.appendChild(styleElement);

export default Menu;
