import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { IoWarning } from "react-icons/io5";
import { SiTicktick } from "react-icons/si";
import { useTheme } from "../../context/ThemeContext";

/**
 * Props for the MessageModal component
 */
type ModalProps = {
    /** Message text to display in the modal */
    message: string;
    /** Type of message determining color and icon */
    type: "ERROR" | "SUCCESS" | "INFO";
    /** Whether the modal is currently visible */
    isShowing: boolean;
    /** Function to set visibility state */
    setIsShowing: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * MessageModal component that displays temporary notifications to the user
 * 
 * Features:
 * - Automatically dismisses after a timeout
 * - Uses different colors and icons based on message type
 * - Smooth enter/exit animations
 * - Theme-aware styling
 */
const MessageModal: React.FC<ModalProps> = ({ message, type, isShowing, setIsShowing }) => {
    const [internalMessage, setInternalMessage] = useState(message);
    const { themeColors } = useTheme();

    // Handle message changes while modal is open
    useEffect(() => {
        if (isShowing && message !== internalMessage) {
            setIsShowing(false);
            const timeout = setTimeout(() => {
                setInternalMessage(message);
                setIsShowing(true);
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            setInternalMessage(message);
        }
    }, [message]);

    // Auto-dismiss the modal after 3 seconds
    useEffect(() => {
        if (isShowing) {
            const timer = setTimeout(() => {
                setIsShowing(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isShowing, setIsShowing]);

    const typeStyles = {
        ERROR: { backgroundColor: "#ef4444", color: "#ffffff" },
        SUCCESS: { backgroundColor: "#10b981", color: "#ffffff" },
        INFO: { backgroundColor: themeColors.accent, color: "#ffffff" },
    };

    return (
        <AnimatePresence>
            {isShowing && (
                <motion.div
                    className="absolute top-[10vh] left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg max-w-sm w-full flex justify-center items-center gap-2 text-lg font-semibold z-1"
                    style={typeStyles[type]}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {type === 'ERROR' ? (<IoWarning />) : type === 'SUCCESS' ? (<SiTicktick />) : (<FaCircleInfo />)}
                    <h3 className="text-center">{internalMessage}</h3>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MessageModal;