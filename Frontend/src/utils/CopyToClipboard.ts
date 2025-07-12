export const copyToClipboard = (mode: string, result: any) => {
    if (!navigator.clipboard) {
        alert("Your current browser does not support clipboard copying..");
        return;
    }

    let text = "";
    if (mode === "Furigana") {
        text = result.furigana
            .map((line: string, idx: number) => `📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}\n${line}`)
            .join("\n\n");
    } else {
        text = result.vocabulary
            .map((sentence: any[], idx: number) => {
                const header = `📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`;
                const words = sentence
                    .map((item: any) => `${item.word} (${item.reading}) - ${item.translation}`)
                    .join("\n");
                return `${header}\n${words}`;
            })
            .join("\n\n");
    }

    navigator.clipboard
        .writeText(text)
        .then(() => console.log("Clipboard copy failed!"))
        .catch((err) => {
            console.error("❌ Clipboard copy failed!:", err);
            alert("❌ Clipboard copy failed!");
        });
};
