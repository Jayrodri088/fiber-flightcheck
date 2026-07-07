import { createRoot } from "react-dom/client";
import { App } from "./App";
// @ts-ignore Parcel handles the side-effect CSS import.
import "../styles.css";

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
