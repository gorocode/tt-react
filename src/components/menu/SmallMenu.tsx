import { useEffect, useState } from "react";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import type { MenuItemType, MenuType } from "../../types";

// Icons
import { MdInfo } from "react-icons/md";

/**
 * Props for the SmallMenu component
 * @interface MenuProps
 */
type MenuProps = {
    /** Menu data to display */
    menu: MenuType | undefined;
    /** Callback function when an item is selected */
    sendItem: (item: MenuItemType) => void;
};

/**
 * SmallMenu Component
 * 
 * A compact, grid-based menu layout used for quickly selecting menu items.
 * Displays menu items organized by categories with images for visual identification.
 * Used in contexts where space efficiency is important.
 *
 * @param {MenuProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const Menu = ({ menu, sendItem }: MenuProps) => {
    // Theme and state setup
    const { themeColors } = useTheme();
    const [sortedMenu, setSortedMenu] = useState<MenuType | undefined>();

    /**
     * Sort menu categories and items by their menuOrder when menu data changes
     */
    useEffect(() => {
        setSortedMenu(
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
    }, [menu]);

    return (
        <div className="h-fit w-full max-w-[800px] p-4 flex flex-col gap-2 border-l-1 border-dotted" style={{
            backgroundColor: themeColors.background,
            color: themeColors.text,
            borderColor: themeColors.secondary
        }}>
            {/* Render categories and their menu items */}
            {sortedMenu?.categories?.flatMap((category) => (
                <>
                    {category.name !== "No category" && (
                        <>
                            <h3 className="text-2xl font-semibold ">{category.name}</h3>
                            <div className="w-full flex items-center mb-1">
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${themeColors.secondary}, ${themeColors.accent}, transparent)` }}></div>
                            </div>
                            {/* Decorative gradient divider */}
                        </>
                    )}
                    {/* Grid of menu items for this category */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {category.menuItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => sendItem(item)}
                                className="w-30 flex flex-col items-center p-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200" style={{
                                    borderColor: themeColors.secondary,
                                    backgroundColor: themeColors.primary === themeColors.background ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                                }}>
                                {item.product?.url ? (
                                    <img
                                        className="h-16 w-16 rounded-full object-cover mb-2"
                                        src={item.product.url}
                                        alt={item.product?.name || "Product image"}
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 flex items-center justify-center rounded-lg"
                                        style={{ background: `color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})` }}
                                    >
                                        <MdInfo size={24} style={{ color: themeColors.accent }} />
                                    </div>
                                )}
                                <p className="text-sm font-semibold text-center">{item.product?.name || "Unnamed Product"}</p>
                            </div>
                        ))}
                    </div>
                </>
            ))}
        </div>
    );
};

export default Menu;
