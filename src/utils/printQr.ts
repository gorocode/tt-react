/**
 * printQR.ts
 * Utility for generating and printing QR codes for restaurant tables
 * Creates a printable page with multiple QR codes that link to customer menu URLs
 */

// Utilities
import { encodeId } from './obfuscate';

// Types
import { TableType } from '../types';

// Configuration
import config from '../config';

/**
 * Generates and prints QR codes for multiple tables
 * Opens a new browser window with formatted QR codes ready for printing
 * 
 * Features:
 * - Creates one QR code per table
 * - Uses table ID obfuscation for security
 * - Automatically triggers print dialog after rendering
 * - Responsive layout for printing multiple codes
 * 
 * @param {TableType[]} tables - Array of tables to generate QR codes for
 * @returns {void}
 */
export const printMultipleQRCodes = (tables: TableType[]) => {
    // Open a new window for QR code display and printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return; // Exit if popup is blocked

    // Generate HTML containers for each table's QR code
    const qrHtml = tables.map(table => {
        return `
            <div class="qr-container">
                <h5>Table #${table.number}</h5>
                <div id="qr-${table.id}"></div>
            </div>
        `;
    }).join('');

    // Write the complete HTML document to the new window
    // Including styles, QR containers, and the script to generate QR codes
    printWindow.document.write(`
        <html>
            <head>
                <title>QR Codes</title>
                <style>
                    body {
                        font-family: sans-serif;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 30px;
                        padding: 40px;
                        justify-content: center;
                        align-items: center;
                    }
                    .qr-container {
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        padding: 5px;
                        text-align: center;
                        height: fit-content;
                    }
                    h5 {
                        margin: 0;
                        font-size: 1.5em;
                    }
                </style>
            </head>
            <body>
                ${qrHtml}
                <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
                <script>
                    // Prepare table data with encoded IDs for QR code generation
                const tables = ${JSON.stringify(tables.map(t => ({ id: t.id, number: t.number, encodedId: encodeId(t.id) })))};
                    tables.forEach(table => {
                        // Create URL for customer menu access with encoded table ID
                        const url = "${config.FRONT_URL}/menu/table/" + table.encodedId;
                        const container = document.getElementById("qr-" + table.id);
                        // Generate QR code using QRCode.js library
                        QRCode.toCanvas(document.createElement("canvas"), url, { width: 150 }, (err, canvas) => {
                            if (!err && container) {
                                container.appendChild(canvas);
                            }
                        });
                    });
                    // Automatically trigger print dialog after QR codes are rendered
                    // Small delay ensures all QR codes are properly rendered first
                    window.onload = () => {
                        setTimeout(() => {
                            window.print();
                        }, 1000);
                    }
                </script>
            </body>
        </html>
    `);

    // Finalize the document in the new window
    printWindow.document.close();
};
