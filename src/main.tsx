import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { MessageModalProvider } from './context/MessageModalContext.tsx'
import { QuestionModalProvider } from './context/QuestionModalContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <QuestionModalProvider>
                    <MessageModalProvider>
                        <App />
                    </MessageModalProvider>
                </QuestionModalProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
