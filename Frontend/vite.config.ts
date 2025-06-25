import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { qrcode } from "vite-plugin-qrcode";

// https://vite.dev/config/
export default defineConfig({
    base: process.env.VITE_BASE_URL,
    plugins: [react(), qrcode()],
    server: {
        host: true,
    },
});
