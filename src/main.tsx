
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Просто запускаем приложение без инициализации storage
createRoot(document.getElementById("root")!).render(<App />);
  