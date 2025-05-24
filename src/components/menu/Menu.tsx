import { JSX, useEffect, useRef, useState } from "react";
import { motion, Reorder } from "motion/react";

// Icons
import { TiArrowDownThick, TiArrowUpThick } from "react-icons/ti";
import { MdInfo, MdRestaurantMenu } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosSave } from "react-icons/io";
import { PiArrowArcLeftBold } from "react-icons/pi";

// Context
import { useTheme } from "../../context/ThemeContext";
import { useQuestionModal } from "../../context/QuestionModalContext";

// Types
import type { MenuItemType, MenuType } from "../../types";

/**
 * Props for the Menu component
 * @interface MenuProps
 */
type MenuProps = {
    /** Menu data to display or edit */
    menu: MenuType | undefined;
    /** Function to update the menu data */
    setMenu: React.Dispatch<React.SetStateAction<MenuType | undefined>>;
    /** Whether the menu is in edit mode (allows reordering) */
    isEditMode?: boolean;
    /** Function to handle editing a menu item */
    editMenuItem: (item: MenuItemType) => void;
    /** Function to save the menu data */
    saveMenu: () => void;
    /** Function to reset the menu data */
    resetMenu: () => void;
};

/**
 * Menu Component
 * 
 * Staff/admin view of the restaurant menu with category and item display.
 * Supports edit mode for reordering categories and menu items.
 * Features smooth scrolling navigation and themed visual elements.
 *
 * @param {MenuProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const Menu = ({ menu, setMenu, isEditMode, editMenuItem, saveMenu, resetMenu }: MenuProps): JSX.Element => {
    // Theme and state setup
    const { themeColors } = useTheme();
    const categoryRefs = useRef<{ [key: number]: HTMLDivElement }>({});
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const { askQuestion } = useQuestionModal();

    /**
     * Sort menu categories and items by their menuOrder when menu data changes
     */
    useEffect(() => {
        setMenu(
            menu
                ? {
                    ...menu,
                    categories: menu.categories
                        .sort((a, b) => a.menuOrder - b.menuOrder)
                        .map((category) => ({
                            ...category,
                            menuItems: category.menuItems.sort(
                                (a, b) => a.menuOrder - b.menuOrder
                            ),
                        })),
                }
                : undefined
        );
    }, [isEditMode]);

    /**
     * Change the order of a category by moving it up or down
     * Updates menuOrder values to maintain sorted order
     * 
     * @param {number} categoryId - ID of the category to move
     * @param {boolean} direction - Direction to move (true = down, false = up)
     */
    const changeCategoryOrder = (categoryId: number, direction: boolean) => {
        setMenu((prev) => {
            if (!prev) return prev;

            const updatedCategories = [...prev.categories];

            const categoryIndex = updatedCategories.findIndex(
                (category) => category.id === categoryId
            );

            if (categoryIndex === -1) return prev;

            const categoryToMove = updatedCategories[categoryIndex];

            const swapIndex = direction
                ? categoryIndex + 1
                : categoryIndex - 1;

            if (swapIndex < 0 || swapIndex >= updatedCategories.length) return prev;

            updatedCategories[categoryIndex] = updatedCategories[swapIndex];
            updatedCategories[swapIndex] = categoryToMove;

            updatedCategories[categoryIndex].menuOrder = categoryIndex;
            updatedCategories[swapIndex].menuOrder = swapIndex;

            updatedCategories.sort((a, b) => a.menuOrder - b.menuOrder);

            return {
                ...prev,
                categories: updatedCategories,
            };
        });
    };

    /**
     * Update the order of menu items within a category
     * Called after drag-and-drop reordering
     * 
     * @param {number} categoryId - ID of the category containing the items
     * @param {any[]} newItems - The reordered array of menu items
     */
    const updateMenuItemOrder = (categoryId: number, newItems: any[]) => {
        setMenu((prev) =>
            prev
                ? {
                    ...prev,
                    categories: prev.categories.map((category) =>
                        category.id === categoryId
                            ? {
                                ...category,
                                menuItems: newItems.map((item, index) => ({
                                    ...item,
                                    menuOrder: index,
                                })),
                            }
                            : category
                    ),
                }
                : undefined
        );
    };

    /**
     * Delete a menu item after user confirmation
     * 
     * @param {number} itemId - ID of the menu item to delete
     */
    const deleteMenuItem = async (itemId: number) => {
        const confirmed = await askQuestion("Are you sure you want to delete this menu item?");
        if (!confirmed) return;

        setMenu((prev) => {
            if (!prev) return prev;

            const updatedCategories = prev.categories
                .map((category) => {
                    const updatedMenuItems = category.menuItems.filter(
                        (item) => item.id !== itemId
                    );
                    return { ...category, menuItems: updatedMenuItems };
                })
                .filter((category) => category.menuItems.length > 0);

            return { ...prev, categories: updatedCategories };
        });
    };


    return (
        <motion.div
            className="h-full w-full p-5 md:p-6 rounded-xl overflow-x-hidden select-none bg-opacity-95 shadow-sm"
            style={{ backgroundColor: themeColors.background, color: themeColors.text }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <motion.div
                className="w-full mb-6 rounded-2xl p-6 relative overflow-hidden shadow-md backdrop-blur-sm border border-opacity-20"
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

                <div className="w-full flex items-center justify-between">
                    <div className="w-full flex items-center gap-3 mx-auto">
                        {isEditMode ? (
                            <div className="w-full flex justify-center items-center gap-3 mx-auto">
                                <div className="flex items-center">
                                    <motion.input
                                        onChange={(e) => setMenu((prev) => prev ? { ...prev, name: e.target.value } : undefined)}
                                        type="text"
                                        value={menu?.name}
                                        className="w-[100%] text-center font-bold text-3xl md:text-4xl tracking-tight focus:outline-none focus:ring-0 bg-transparent overflow-visible"
                                        style={{
                                            color: themeColors.accent

                                        }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                        onFocus={(e) => (e.target as HTMLInputElement).scrollLeft = e.target.scrollWidth}
                                    />
                                </div>
                                <div className="flex items-center gap-3 z-10 ml-4">
                                    <div className="relative group select-none">
                                        <motion.button
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                            className="btn btn-icon btn-success btn-with-icon-animation p-2 rounded-full shadow-sm flex items-center justify-center"
                                            onClick={saveMenu}
                                        >
                                            <IoIosSave size={24} />
                                        </motion.button>
                                        <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 dark:bg-white/90 dark:text-black text-white px-2 py-1 rounded-md">
                                            Save
                                        </span>
                                    </div>
                                    <div className="relative group select-none">
                                        <motion.button
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                            className="btn btn-icon btn-primary btn-with-icon-animation p-2 rounded-full shadow-sm flex items-center justify-center"
                                            onClick={resetMenu}
                                        >
                                            <PiArrowArcLeftBold size={24} />
                                        </motion.button>
                                        <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 dark:bg-white/90 dark:text-black text-white px-2 py-1 rounded-md">
                                            Reset
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex items-center justify-center gap-3 mx-auto">
                                <MdRestaurantMenu className="text-3xl md:text-4xl mr-3 opacity-90" style={{ color: themeColors.accent }} />

                                <h1
                                    className="font-bold text-3xl md:text-4xl tracking-tight"
                                    style={{
                                        color: themeColors.accent
                                    }}
                                >
                                    {menu?.name || "Menu"}
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full flex items-center my-5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
                        style={{ backgroundColor: themeColors.text }}
                    />
                </div>
                {isEditMode ? (
                    <textarea
                        className="w-full text-base md:text-lg text-center bg-transparent focus:outline-none focus:ring-0 rounded-lg px-6 py-2 border border-opacity-10"
                        style={{
                            color: `color-mix(in srgb, ${themeColors.text} 85%, ${themeColors.secondary})`,
                            borderColor: themeColors.accent,
                            letterSpacing: "0.01em",
                            resize: "vertical"
                        }}
                        onChange={(e) => setMenu((prev) => prev ? { ...prev, description: e.target.value } : undefined)}
                        value={menu?.description}
                        placeholder="Enter menu description..."
                        rows={2}
                    >
                        {menu?.description}
                    </textarea>
                ) : (
                    <p className="text-base md:text-lg text-center leading-relaxed italic opacity-80"
                        style={{
                            color: themeColors.text
                        }}>
                        {menu?.description || "Discover our delicious options below!"}
                    </p>
                )}

            </motion.div>

            {/* Horizontal scrolling category navigation bar */}
            {menu?.categories && menu.categories.length > 0 && (
                <div
                    className="mb-6 relative w-full"
                >
                    <div 
                        className="flex gap-2 pb-2 pt-1 px-1 overflow-x-auto scrollbar-hide mask-edges"
                    >
                        {menu.categories.map((category, index) => (
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
                {menu?.categories?.map((category, categoryIndex) => (
                    <motion.div
                        key={category.id}
                        className="bg-white/5 dark:bg-black/5 backdrop-blur-sm rounded-2xl mb-6 overflow-hidden select-none border border-opacity-10 shadow-sm"
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
                            <div className="relative p-4 border-b border-opacity-10 bg-opacity-30" 
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
                                {isEditMode && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 items-center">
                                        {category.menuOrder != 0 && (
                                            <motion.button 
                                                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => changeCategoryOrder(category.id, false)}
                                            >
                                                <TiArrowUpThick className="text-lg opacity-70" />
                                            </motion.button>
                                        )}
                                        {category.menuOrder != menu.categories.length - 1 && (
                                            <motion.button 
                                                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => changeCategoryOrder(category.id, true)}
                                            >
                                                <TiArrowDownThick className="text-lg opacity-70" />
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                            <Reorder.Group
                                axis="y"
                                values={category.menuItems}
                                layoutScroll
                                dragListener={isEditMode}
                                onReorder={(newItems) => isEditMode ? updateMenuItemOrder(category.id, newItems) : null}
                            >
                                                        <div className="p-3 md:p-4 grid gap-4">

                                {category.menuItems.map((item, itemIndex) => (
                                    <Reorder.Item key={item.id} value={item} dragListener={isEditMode} >
                                        <div className="relative">
                                            <motion.div
                                                key={item.id}
                                                className={`rounded-xl p-5 relative select-none overflow-hidden bg-opacity-40 backdrop-blur-[1px] border border-opacity-10`}
                                                style={{
                                                    backgroundColor: item.available ? `color-mix(in srgb, ${themeColors.background} 98%, ${themeColors.accent})` : `color-mix(in srgb, ${themeColors.background} 98%, gray)`,
                                                    borderColor: item.available ? themeColors.accent : 'gray',
                                                    boxShadow: `0 4px 20px -8px ${item.available ? themeColors.accent + '25' : 'rgba(0,0,0,0.1)'}`,
                                                    transition: "all 0.3s ease"
                                                }}
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: item.available ? 1 : 0.65, scale: 1, y: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 25,
                                                    delay: 0.05 * itemIndex
                                                }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    boxShadow: `0 6px 25px -5px ${item.available ? themeColors.accent + '30' : 'rgba(0,0,0,0.15)'}`
                                                }}
                                            >
                                                {/* Subtle background decoration */}
                                                <div
                                                    className="absolute -top-6 -right-6 w-36 h-36 opacity-5 rounded-full blur-xl"
                                                    style={{
                                                        background: `radial-gradient(circle at top right, ${item.available ? themeColors.accent : '#888'}, transparent 70%)`
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
                                                                    <h4 className="text-base font-medium"
                                                                        style={{
                                                                            color: themeColors.primary
                                                                        }}>
                                                                        {item.product.name}
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
                                                            style={{
                                                                color: themeColors.accent
                                                            }}>
                                                            {item.price.toFixed(2)} €
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            {isEditMode && (
                                                <div className="absolute bottom-3 right-5 flex gap-3">
                                                    <div className="relative group select-none" key="menu-item-availability">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-secondary btn-with-icon-animation shadow-sm rounded-full p-2 flex items-center justify-center"
                                                            onClick={() => setMenu(
                                                                (prev) => {
                                                                    if (prev) {
                                                                        const updatedCategories = prev.categories.map((prevCategory) => {
                                                                            if (prevCategory.id === category.id) {
                                                                                const updatedMenuItems = prevCategory.menuItems.map((prevItem) =>
                                                                                    prevItem.id === item.id
                                                                                        ? { ...prevItem, available: !prevItem.available } // Toggle availability
                                                                                        : prevItem
                                                                                );
                                                                                return { ...prevCategory, menuItems: updatedMenuItems };
                                                                            }
                                                                            return prevCategory;
                                                                        });
                                                                        return { ...prev, categories: updatedCategories };
                                                                    }
                                                                })}
                                                        >
                                                            {item.available ? (
                                                                <FaEye size={20} />
                                                            ) : (
                                                                <FaEyeSlash size={20} />
                                                            )}
                                                        </motion.button>
                                                        <span
                                                            className="absolute top-full mt-1.5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 dark:bg-white/90 dark:text-black text-white px-2 py-1 rounded-md"
                                                        >
                                                            {item.available ? "Available" : "Unavailable"}
                                                        </span>
                                                    </div>
                                                    <div className="relative group select-none" key="edit-menu-item">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-outline-accent btn-with-icon-animation shadow-sm rounded-full p-2 flex items-center justify-center"
                                                            onClick={() => editMenuItem(item)}
                                                        >
                                                            <BiSolidEdit size={20} />
                                                        </motion.button>
                                                        <span
                                                            className="absolute top-full mt-1.5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 dark:bg-white/90 dark:text-black text-white px-2 py-1 rounded-md"
                                                        >
                                                            Edit
                                                        </span>
                                                    </div>
                                                    <div className="relative group select-none" key="delete-menu-item">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-danger btn-with-icon-animation shadow-sm rounded-full p-2 flex items-center justify-center"
                                                            onClick={() => deleteMenuItem(item.id)}
                                                        >
                                                            <RiDeleteBin6Fill size={20} />
                                                        </motion.button>
                                                        <span
                                                            className="absolute top-full mt-1.5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 dark:bg-white/90 dark:text-black text-white px-2 py-1 rounded-md"
                                                        >
                                                            Delete
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Reorder.Item>
                                ))}</div>
                            </Reorder.Group>
                        
                    </motion.div>

                ))}
            </div>

        </motion.div >
    );
};

export default Menu;
