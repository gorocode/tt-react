import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdClose, MdPayment } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';

// Config
import config from '../../config';

/**
 * Props for the PayPalButton component
 * @interface PayPalButtonProps
 */
interface PayPalButtonProps {
    /** The amount to be paid in EUR */
    paymentAmount: number;
    /** Whether the PayPal modal is visible */
    isVisible: boolean;
    /** Callback function when the modal is closed */
    onClose: () => void;
    /** Callback function when payment is approved with payment details */
    onPaymentApprove: (details: any) => void;
}

/**
 * Extends the Window interface to include the PayPal SDK
 */
declare global {
    interface Window {
        /** PayPal SDK injected into the window object */
        paypal: any;
    }
}

/**
 * PayPalButton Component
 * 
 * Provides a modal interface for processing payments through PayPal.
 * Dynamically loads the PayPal SDK and renders the payment buttons.
 * Handles payment approval and provides appropriate styling based on theme context.
 *
 * @param {PayPalButtonProps} props - Component props
 * @returns {JSX.Element | null} The rendered component or null when not visible
 */
function PayPalButton({ paymentAmount, isVisible, onClose, onPaymentApprove }: PayPalButtonProps) {
    // State for tracking PayPal SDK loading status
    const [isPaypalLoaded, setIsPaypalLoaded] = useState(false);
    
    // Theme context for styling
    const { themeColors } = useTheme();

    /**
     * Controls body scroll behavior when modal is visible
     * Prevents scrolling of the background content when modal is open
     */
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflowY = 'auto';
        }
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, [isVisible]);

    /**
     * Loads the PayPal SDK script if not already loaded
     * Sets the isPaypalLoaded state to true when SDK is ready
     */
    useEffect(() => {
        if (window.paypal) {
            setIsPaypalLoaded(true);
        } else {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${config.PAYPAL_ID}&components=buttons&currency=EUR`;
            script.onload = () => setIsPaypalLoaded(true);
            document.body.appendChild(script);
        }
    }, []);

    /**
     * Renders the PayPal buttons when SDK is loaded and modal is visible
     * Configures the payment amount and handles approval flow
     */
    useEffect(() => {
        if (isPaypalLoaded && isVisible) {
            window.paypal.Buttons({
                // Create a PayPal order with the specified amount
                createOrder: (_data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: paymentAmount,
                                    currency_code: 'EUR',
                                },
                            },
                        ],
                    });
                },
                // Handle successful payment approval
                onApprove: (_data: any, actions: any) => {
                    return actions.order.capture().then((details: any) => {
                        if (onPaymentApprove) {
                            onPaymentApprove(details);
                        }
                    });
                },
                // Handle payment errors
                onError: (err: Error) => {
                    console.error('Error:', err);
                },
            }).render('#paypal-button-container');
        }
    }, [isPaypalLoaded, isVisible, paymentAmount, onPaymentApprove]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    className="fixed inset-0 flex justify-center items-center z-[1001]" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <motion.div 
                        className="flex flex-col bg-white dark:bg-gray-800 w-full sm:w-[500px] max-w-[95vw] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden"
                        style={{
                            backgroundColor: themeColors.background,
                            border: `1px solid ${themeColors.secondary}`,
                            color: themeColors.text
                        }}
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Modal header with title and close button */}
                        <div 
                            className="p-4 flex justify-between items-center border-b"
                            style={{
                                borderColor: `color-mix(in srgb, ${themeColors.secondary} 30%, ${themeColors.background})`,
                                background: `linear-gradient(to right, color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background}), ${themeColors.background})`
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <MdPayment size={24} style={{ color: themeColors.accent }} />
                                <h2 className="text-xl font-bold tracking-tight" style={{ color: themeColors.primary }}>
                                    Payment Method
                                </h2>
                            </div>
                            <motion.button
                                className="p-1 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${themeColors.secondary} 15%, ${themeColors.background})`,
                                    color: themeColors.secondary
                                }}
                                onClick={onClose}
                                whileHover={{ scale: 1.1, backgroundColor: `color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})` }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Close Payment Methods"
                            >
                                <MdClose size={20} />
                            </motion.button>
                        </div>
                        
                        {/* Payment amount display section */}
                        <div className="px-6 py-4 text-center">
                            <p className="text-sm mb-1" style={{ color: themeColors.secondary }}>Payment amount:</p>
                            <p 
                                className="text-2xl font-bold mb-4" 
                                style={{ 
                                    color: themeColors.accent,
                                    textShadow: '0 1px 1px rgba(0,0,0,0.1)'
                                }}
                            >
                                {paymentAmount.toFixed(2)} €
                            </p>
                            <div 
                                className="h-px w-full my-2" 
                                style={{ 
                                    background: `linear-gradient(to right, transparent, ${themeColors.secondary}, transparent)`,
                                    opacity: 0.3
                                }}
                            />
                        </div>

                        {/* Container for PayPal SDK to render buttons */}
                        <div 
                            id="paypal-button-container" 
                            className="p-6 overflow-y-auto w-full max-h-[400px]" 
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PayPalButton;