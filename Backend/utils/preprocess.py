import cv2
import numpy as np
from PIL import Image


def preprocess_image(pil_image: Image.Image) -> np.ndarray:
    image = np.array(pil_image)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    # 예: 이진화 또는 잡음 제거 등 추가 가능
    return gray
