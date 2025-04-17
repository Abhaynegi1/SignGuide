import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";

const SignLanguageTranslator = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  // Function to handle file upload
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      extractText(file);
    }
  }, []);

  // OCR: Extract text from image
  const extractText = (file) => {
    Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      setExtractedText(text);
      translateToSignLanguage(text);
    });
  };

  // Improved sign language translation function with appropriate hand sign emojis
  const translateToSignLanguage = (text) => {
    const signMap = {
      'a': '👇', 'b': '👊', 'c': '🤏', 'd': '👆', 'e': '👌', 
      'f': '👉', 'g': '👍', 'h': '🖐️', 'i': '🤙', 'j': '🤞',
      'k': '🖖', 'l': '👐', 'm': '✌️', 'n': '👋', 'o': '👏', 
      'p': '👎', 'q': '🤝', 'r': '✊', 's': '👊', 't': '👈',
      'u': '🤘', 'v': '✌️', 'w': '👋', 'x': '☝️', 'y': '🤙', 
      'z': '👈', ' ': '▫️',
      '0': '👌', '1': '☝️', '2': '✌️', '3': '🤟', '4': '🖖',
      '5': '🖐️', '6': '👊', '7': '🤞', '8': '👉', '9': '👈'
    };

    // Convert text to lowercase and map each character to its corresponding sign
    const signTranslation = text.toLowerCase().split("").map(char => {
      // If the character has a mapping, use it; otherwise, use the character itself
      return signMap[char] ? `${signMap[char]}(${char})` : char;
    }).join(" ");
    
    setTranslatedText(signTranslation);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl mb-6">Sign Language Translator</h1>

      {/* Drag & Drop Upload Section */}
      <div
        {...getRootProps()}
        className="w-full max-w-lg border-2 border-dashed border-white p-6 rounded-lg text-center cursor-pointer bg-white text-black"
      >
        <input {...getInputProps()} />
        <p className="text-lg bg-sec px-4 py-10 border-2 border-black">Drag & Drop an image here, or click to upload</p>
      </div>

      {/* Image Preview */}
      {image && (
        <div className="mt-4">
          <img src={image} alt="Uploaded" className="max-w-xs rounded-lg shadow-md" />
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl">Extracted Text</h2>
          <p className="bg-white text-black p-3 rounded-md">{extractedText}</p>
        </div>
      )}

      {/* Translated Text */}
      {translatedText && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl">Sign Language Translation</h2>
          <p className="bg-white text-black p-3 rounded-md">{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default SignLanguageTranslator;