/**
 * Application configuration object
 * Contains environment-specific values loaded from .env files via Vite
 */
const config = {
  /** Base URL for API requests */
  BASE_URL: import.meta.env.VITE_API_URL,
  /** WebSocket URL for real-time communication */
  WS_URL: import.meta.env.VITE_WS_URL,
  /** Frontend URL for callbacks and redirects */
  FRONT_URL: import.meta.env.VITE_FRONT_URL,
  /** PayPal client ID for payment integration */
  PAYPAL_ID: import.meta.env.VITE_PAYPAL_ID,
  /** Cloudinary cloud name for media uploads */
  CLOUDINARY_NAME: import.meta.env.VITE_CLOUDINARY_NAME,
  /** Cloudinary upload preset for media uploads */
  CLOUDINARY_PRESENT: import.meta.env.VITE_CLOUDINARY_PRESENT,
  /** Salt used for QR code generation/validation */
  QR_SALT: import.meta.env.VITE_QR_SALT,
};

export default config;