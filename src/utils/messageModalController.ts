/**
 * Types of messages that can be displayed in the modal
 */
type ModalType = "ERROR" | "SUCCESS" | "INFO";

/**
 * Function signature for showing a message modal
 */
type ShowMessageModalFn = (type: ModalType, message: string) => void;

/**
 * Reference to the modal display function, initialized by the MessageModalProvider
 */
let showModalFn: ShowMessageModalFn | null = null;

/**
 * Sets the function reference that will be used to display message modals
 * This is called by the MessageModalProvider on initialization
 * 
 * @param fn Function provided by MessageModalProvider to show modals
 */
export const setShowMessageModal = (fn: ShowMessageModalFn) => {
    showModalFn = fn;
};

/**
 * Displays a message modal with the specified type and message
 * Can be called from anywhere in the application
 * 
 * @param type Type of message (ERROR, SUCCESS, INFO)
 * @param message Text content to display in the modal
 */
export const showMessageModal = (type: ModalType, message: string) => {
    if (showModalFn) {
        showModalFn(type, message);
    } else {
        console.warn("showMessageModal not initialized yet");
    }
};
