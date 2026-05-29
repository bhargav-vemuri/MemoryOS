import pytesseract
from PIL import Image
import os

class OCRService:
    @staticmethod
    def extract_text_from_image(image_path: str) -> str:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")
        
        # Depending on OS, tesseract cmd might need to be set. 
        # In Docker (Linux), it's usually in PATH.
        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            return text.strip()
        except Exception as e:
            print(f"Error during OCR: {e}")
            return ""

ocr_service = OCRService()
