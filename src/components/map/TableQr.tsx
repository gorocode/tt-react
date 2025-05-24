import { useRef } from 'react';
import { motion } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';

// Utils and Config
import { encodeId } from '../../utils/obfuscate';
import config from '../../config';

// Types
import { TableType } from '../../types';

/**
 * Props for the TableQR component
 * @interface Props
 */
type Props = {
    /** The table for which to generate the QR code */
    table: TableType;
    /** Function to close the QR code modal */
    onClose: () => void;
};

/**
 * TableQR Component
 * 
 * Displays a QR code modal for a specific table, allowing customers to access the table-specific menu.
 * Provides options to print, save as PDF, or download the QR code as a PNG file.
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const TableQR = ({ table, onClose }: Props) => {
    // Generate encoded table ID and full customer-facing URL
    const encodedId = encodeId(table.id);
    const url = `${config.FRONT_URL}/menu/table/${encodedId}`;

    // Reference to the QR code container for printing and export
    const printRef = useRef<HTMLDivElement>(null);

    /**
     * Handles printing the QR code
     * Opens a new window with a printable version of the QR code and triggers the print dialog
     */
    const handlePrint = () => {
        const canvas = printRef.current?.querySelector('canvas') as HTMLCanvasElement;

        if (!canvas) return;

        const clonedCanvas = document.createElement('canvas');
        clonedCanvas.width = canvas.width;
        clonedCanvas.height = canvas.height;

        const ctx = clonedCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(canvas, 0, 0);

        const dataUrl = clonedCanvas.toDataURL('image/png');

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Table #${table.number}</title>
                    <style>
                        body {
                            font-family: sans-serif;
                            text-align: center;
                            padding: 20px;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <h2>QR Table #${table.number}</h2>
                    <img src="${dataUrl}" alt="QR Code for Table ${table.number}" />
                    <p style="font-size: 12px; word-break: break-word;">${url}</p>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    /**
     * Handles downloading the QR code as a PNG image
     * Creates a temporary anchor element to trigger the download
     */
    const handleDownload = () => {
        const canvas = printRef.current?.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qr-table-${table.number}.png`;
        a.click();
    };


    return (
        <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-4 relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={printRef} className="flex flex-col items-center">
                    <h2 className="text-xl font-bold">QR Table #{table.number}</h2>
                    <QRCodeCanvas value={url} size={200} />
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-center block text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                    >
                        {url}
                    </a>

                </div>

                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                        onClick={handlePrint}
                    >
                        Print
                    </button>
                    <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                        onClick={handlePrint}
                    >
                        PDF
                    </button>
                    <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                        onClick={handleDownload}
                    >
                        PNG
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TableQR;
