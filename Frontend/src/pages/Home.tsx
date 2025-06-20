import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const goToUpload = () => {
        navigate("/upload");
    };

    return (
        <div className="w-full flex justify-center items-center font-Pretendard">
            <div className="w-full max-w-sm h-[768px] px-4 py-6 bg-[url(/home_background.png)] flex flex-col items-center justify-center gap-3">
                <p className="font-bold text-2xl">Struggling to read Kanji</p>
                <p className="font-normal font-xs text-center">
                    paste Japanese text or upload an image
                    <br />
                    to get instant Furigana.
                </p>
                <Button size="small" variant="primary" onClick={goToUpload}>
                    Let's Start
                </Button>
            </div>
        </div>
    );
};

export default Home;
