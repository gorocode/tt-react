import React, { createContext, useContext, useState } from "react";
import QuestionModal from "../components/global/QuestionModal";

/**
 * Question modal context interface defining available functionality
 */
type QuestionModalContextType = {
    /**
     * Displays a confirmation dialog with the provided question text
     * @param question The question to display to the user
     * @returns Promise that resolves to true if confirmed, false if canceled
     */
    askQuestion: (question: string) => Promise<boolean>;
};

/**
 * Context that provides question confirmation functionality throughout the app
 */
const QuestionModalContext = createContext<QuestionModalContextType | undefined>(undefined);

/**
 * Custom hook for accessing the question modal functionality
 * @returns The question modal context with askQuestion method
 * @throws Error if used outside of QuestionModalProvider
 */
export const useQuestionModal = () => {
    const context = useContext(QuestionModalContext);
    if (!context) throw new Error("useQuestionModal must be used within a QuestionModalProvider");
    return context;
};

/**
 * Provider component that makes question confirmation functionality available
 * throughout the application. Manages the state and visibility of confirmation dialogs.
 * 
 * @param children React nodes to be wrapped by the provider
 */
export const QuestionModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [question, setQuestion] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [resolve, setResolve] = useState<(result: boolean) => void>();

    /**
     * Displays a confirmation dialog with the provided question
     * @param text The question text to display
     * @returns Promise that resolves to true (confirmed) or false (canceled)
     */
    const askQuestion = (text: string): Promise<boolean> => {
        setQuestion(text);
        setIsOpen(true);
        return new Promise((resolve) => setResolve(() => resolve));
    };

    /**
     * Handles the confirmation action and resolves the promise with true
     */
    const handleConfirm = () => {
        setIsOpen(false);
        resolve?.(true);
    };

    /**
     * Handles the cancellation action and resolves the promise with false
     */
    const handleCancel = () => {
        setIsOpen(false);
        resolve?.(false);
    };

    return (
        <QuestionModalContext.Provider value={{ askQuestion }}>
            {children}
            <QuestionModal
                question={question}
                isOpen={isOpen}
                onConfirm={handleConfirm}
                setIsOpen={() => handleCancel()}
            />
        </QuestionModalContext.Provider>
    );
};
