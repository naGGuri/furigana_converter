export interface historyProps {
    id: number;
    conversion_type: "furigana" | "vocabulary";
    file_names: string[];
    created_at: string; // ISO 8601 date string
}
