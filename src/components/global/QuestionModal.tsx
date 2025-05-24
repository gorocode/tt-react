import { useTheme } from "../../context/ThemeContext";

/**
 * Props for the QuestionModal component
 */
interface ModalProps {
    /** The question or confirmation message to display */
    question: string;
    /** Callback function triggered when the user confirms the action */
    onConfirm: () => void;
    /** Whether the modal is currently open/visible */
    isOpen: boolean;
    /** Function to control the modal's open state */
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * QuestionModal component
 * 
 * A reusable confirmation dialog that prompts the user with a question and
 * provides confirm/cancel buttons. Features include:  
 * - Theme-aware styling
 */
const QuestionModal: React.FC<ModalProps> = ({ question, onConfirm, isOpen, setIsOpen }) => {
    const { themeColors } = useTheme();

    if (!isOpen) return null;

    const handleCancel = () => {
        setIsOpen(false);
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/50 flex justify-center items-center z-100">
            <div
                className="p-6 rounded-lg shadow-lg max-w-sm w-full"
                style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.secondary
                }}
            >
                <h3 className="text-lg font-semibold text-center mb-4">{question}</h3>
                <div className="flex justify-between gap-4">
                    <button
                        className="py-2 px-4 rounded-lg font-semibold transition-colors"
                        style={{
                            backgroundColor: themeColors.secondary,
                            color: themeColors.background
                        }}
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="py-2 px-4 rounded-lg font-semibold transition-colors"
                        style={{
                            backgroundColor: themeColors.accent,
                            color: themeColors.background
                        }}
                        onClick={handleConfirm}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;
