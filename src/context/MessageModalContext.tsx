import React, { createContext, useContext, useEffect, useState } from "react";

// Components
import MessageModal from "../components/global/MessageModal";

// Utils
import { setShowMessageModal } from "../utils/messageModalController";

/**
 * Types of messages that can be displayed in the message modal
 * @type {string}
 */
type MessageModalType = "ERROR" | "SUCCESS" | "INFO";

/**
 * Props for the MessageModalContext
 * @interface MessageModalContextProps
 */
interface MessageModalContextProps {
  /** Function to display a message modal with specified type and message */
  showMessageModal: (type: MessageModalType, message: string) => void;
}

/**
 * Context for managing application-wide message modals
 */
const MessageModalContext = createContext<MessageModalContextProps | undefined>(undefined);

/**
 * Custom hook to access the MessageModalContext
 * 
 * @returns {MessageModalContextProps} The MessageModalContext value
 * @throws {Error} If used outside of a MessageModalProvider
 */
export const useMessageModal = () => {
  const context = useContext(MessageModalContext);
  if (!context) {
    throw new Error("useMessageModal must be used within a MessageModalProvider");
  }
  return context;
};

/**
 * Provider component for the MessageModalContext
 * Manages the state and visibility of message modals throughout the application
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The provider component with modal
 */
export const MessageModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modal state
  const [isShowing, setIsShowing] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<MessageModalType>("INFO");

  /**
   * Shows a message modal with the specified type and message
   * 
   * @param {MessageModalType} modalType - Type of modal (ERROR, SUCCESS, INFO)
   * @param {string} msg - Message to display
   */
  const showMessageModal = (modalType: MessageModalType, msg: string) => {
    setMessage(msg);
    setType(modalType);
    setIsShowing(true);
  };

  // Register the showMessageModal function with the utility controller
  // This allows showing modals from outside the React component tree
  useEffect(() => {
    setShowMessageModal(showMessageModal);
  }, []);
  
  return (
    <MessageModalContext.Provider value={{ showMessageModal }}>
      {children}
      <MessageModal
        message={message}
        type={type}
        isShowing={isShowing}
        setIsShowing={setIsShowing}
      />
    </MessageModalContext.Provider>
  );
};
