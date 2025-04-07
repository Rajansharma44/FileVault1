import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title directly
document.title = "FileVault";

createRoot(document.getElementById("root")!).render(<App />);
