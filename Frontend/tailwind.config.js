// tailwind.config.js
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                Pretendard: ["Pretendard"],
            },
            colors: {
                primary1: "#006ffd",
                primary2: "#2897FF",
                primary3: "#6fbaff",
                primary4: "#b4dbff",
                primary5: "#eaf2ff",
                light1: "#c5c6cc",
                light2: "#d4d6dd",
                light3: "#e8e9f1",
                light4: "#f8f9fe",
                light5: "#ffffff",
                dark1: "#1f2024",
                dark2: "#2f3036",
                dark3: "#494a50",
                dark4: "#71727a",
                dark5: "#8f9098",
            },
        },
    },
    plugins: [],
};
