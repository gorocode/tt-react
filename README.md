# Table Talk - Frontend Application

<div align="center">
  <p>
    <a href="../README.md">Main Documentation</a> •
    <a href="../tt-spring/README.md">Backend Documentation</a> •
    <a href="../API.md">API Documentation</a>
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</div>

<div align="center">
  <h3><a href="https://tt.gorocode.dev/manager" target="_blank">🔗 Live Demo</a></h3>
  <p>Demo credentials (all with password <code>Password1234$</code>):</p>
  <table>
    <tr>
      <td><strong>Username</strong></td>
      <td><strong>Role</strong></td>
    </tr>
    <tr>
      <td><code>admin</code></td>
      <td>Administrator (full access)</td>
    </tr>
    <tr>
      <td><code>manager</code></td>
      <td>Manager (reporting and management)</td>
    </tr>
    <tr>
      <td><code>worker</code></td>
      <td>Staff (day-to-day operations)</td>
    </tr>
  </table>
</div>

## 📋 Overview

The Table Talk frontend is built with React and TypeScript, providing a responsive and intuitive user interface for bar and restaurant management. The application features real-time updates through WebSockets, interactive table layouts, and comprehensive order management capabilities.

## ✨ Features

- **Table Management**: Visualize and edit table layouts with an interactive map.
- **Order Management**: Create, update, split, and merge orders effortlessly.
- **Menu Management**: Organize menus and categories, including allergen information.
- **Product Management**: Add, edit, and manage product details.
- **Theme System**: Switch between themes for better usability.
- **Real-Time Notifications**: Stay updated with kitchen orders using WebSockets.

## 🛠️ Technologies Used

- **Frontend**: React with TypeScript
- **Styling**: TailwindCSS
- **Animations**: Motion / React
- **State Management**: Context API
- **Backend**: REST API (not included in this repository)
- **WebSockets**: StompJS for real-time communication
- **Build Tool**: Vite

## 🚀 Installation

1. Clone the repository:
  ```bash
    git clone https://github.com/goromigue/tt-react.git
    cd tt-react
  ```

2. Install dependencies:
  ```
    npm install
  ```

3. Configure environment variables in a .env file:
  ```
    VITE_API_URL=your-api-url
    VITE_WS_URL=your-ws-url
    VITE_PAYPAL_ID=your-paypal-id
    VITE_CLOUDINARY_NAME=your-cloudinary-name
    VITE_CLOUDINARY_PRESENT=your-cloudinary-present
  ```

4. Set up credentials:
   - **Cloudinary**:
     1. Create an account at [Cloudinary](https://cloudinary.com/).
     2. Go to your account dashboard.
     3. Copy your account name (Account Name) and set it as `VITE_CLOUDINARY_NAME`.
     4. In the Media Library settings, create an "Upload Preset" and set it as `VITE_CLOUDINARY_PRESENT`.

   - **PayPal**:
     1. Create an account at [PayPal Developer](https://developer.paypal.com/).
     2. Log in to the PayPal Developer Dashboard and create a new application.
     3. Copy the "Client ID" of your application and set it as `VITE_PAYPAL_ID`.



5. Start the development server:
  ```
    npm run dev
  ```

6. Open the application in your browser at http://localhost:5173.


## 📜 Available Scripts

```bash
npm run dev    # Starts the development server.
```

```bash
npm run build  # Builds the project for production.
```

```bash
npm run lint   # Runs ESLint to analyze the code.
```

## 🗂️ Project Structure
  ```
    .
    ├── public/               # Public assets (images, icons, etc.)
    ├── src/                  # Source code
    │   ├── api/              # API services
    │   ├── components/       # Reusable components
    │   ├── context/          # React contexts
    │   ├── hooks/            # Custom hooks
    │   ├── pages/            # Main pages
    │   ├── types.ts          # TypeScript type definitions
    │   └── main.tsx          # Main entry point
    ├── .env                  # Environment variables
    ├── package.json          # Dependencies and scripts
    ├── vite.config.ts        # Vite configuration
    ├── LICENSE.md            # Project license
    └── README.md             # Project documentation
  ```

## 📄 License
This project is licensed under the MIT License.

## 🏗️ Architecture

The frontend application follows a modular architecture with the following key components:

### Component Structure
- **Atomic Design Pattern**: Components are organized following atomic design principles (atoms, molecules, organisms, templates, pages)
- **Container/Presenter Pattern**: Separation of data fetching logic from presentation components

### State Management
- **React Context API**: Used for global state management (auth, theme, etc.)
- **Local Component State**: For component-specific state
- **API Service Layer**: Centralized API communication

### Routing
- **React Router**: Manages application navigation and protected routes

### WebSocket Communication
- **StompJS**: For real-time communication with the backend
- **Message Handlers**: Process incoming WebSocket messages


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
