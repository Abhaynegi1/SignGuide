import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as Tesseract from 'tesseract.js';

const SignLanguageTranslator = () => {
  const [activeTab, setActiveTab] = useState('textToSign');
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [translatedSigns, setTranslatedSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [recognitionProgress, setRecognitionProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Dictionary for ASL letter images
  const letterImages = {
    'a': 'https://cdn.britannica.com/88/249588-131-4C75A31A/letter-A-American-Sign-Language-ASL.jpg',
    'b': 'https://cdn.britannica.com/89/249589-131-A3B7DCBA/letter-B-American-Sign-Language-ASL.jpg',
    'c': 'https://cdn.britannica.com/90/249590-131-F414344C/letter-C-American-Sign-Language-ASL.jpg',
    'd': 'https://cdn.britannica.com/91/249591-131-38A9FBAF/letter-D-American-Sign-Language-ASL.jpg',
    'e': 'https://cdn.britannica.com/92/249592-131-2B4DB879/letter-E-American-Sign-Language-ASL.jpg',
    'f': 'https://cdn.britannica.com/93/249593-131-39768592/letter-F-American-Sign-Language-ASL.jpg',
    'g': 'https://cdn.britannica.com/94/249594-131-1D97E970/letter-G-American-Sign-Language-ASL.jpg',
    'h': 'https://cdn.britannica.com/95/249595-131-F25518D3/letter-H-American-Sign-Language-ASL.jpg',
    'i': 'https://cdn.britannica.com/96/249596-131-B072FA7A/letter-I-American-Sign-Language-ASL.jpg',
    'j': 'https://cdn.britannica.com/97/249597-131-31275AB5/letter-J-American-Sign-Language-ASL.jpg',
    'k': 'https://cdn.britannica.com/98/249598-131-07A70D38/letter-K-American-Sign-Language-ASL.jpg',
    'l': 'https://cdn.britannica.com/99/249599-131-DEE11214/letter-L-American-Sign-Language-ASL.jpg',
    'm': 'https://cdn.britannica.com/00/249600-131-5F563D21/letter-M-American-Sign-Language-ASL.jpg',
    'n': 'https://cdn.britannica.com/01/249601-131-D2B9B51F/letter-N-American-Sign-Language-ASL.jpg',
    'o': 'https://cdn.britannica.com/02/249602-131-46E13C9D/letter-O-American-Sign-Language-ASL.jpg',
    'p': 'https://cdn.britannica.com/03/249603-131-8595D17A/letter-P-American-Sign-Language-ASL.jpg',
    'q': 'https://cdn.britannica.com/04/249604-131-A9B3A46B/letter-Q-American-Sign-Language-ASL.jpg',
    'r': 'https://cdn.britannica.com/05/249605-131-84B39132/letter-R-American-Sign-Language-ASL.jpg',
    's': 'https://cdn.britannica.com/06/249606-131-19958765/letter-S-American-Sign-Language-ASL.jpg',
    't': 'https://cdn.britannica.com/07/249607-131-37ACD0D9/letter-T-American-Sign-Language-ASL.jpg',
    'u': 'https://cdn.britannica.com/08/249608-131-F2E313B2/letter-U-American-Sign-Language-ASL.jpg',
    'v': 'https://cdn.britannica.com/09/249609-131-FD1B25C6/letter-V-American-Sign-Language-ASL.jpg',
    'w': 'https://cdn.britannica.com/10/249610-131-136B9C48/letter-W-American-Sign-Language-ASL.jpg',
    'x': 'https://cdn.britannica.com/11/249611-131-D0108191/letter-X-American-Sign-Language-ASL.jpg',
    'y': 'https://cdn.britannica.com/12/249612-131-B5F72258/letter-Y-American-Sign-Language-ASL.jpg',
    'z': 'https://cdn.britannica.com/13/249613-131-B5F72258/letter-Z-American-Sign-Language-ASL.jpg',
    ' ': 'https://novalin.se/wp-content/uploads/2020/03/Sveagarden-1010--600x446.jpg',
  };

  // Dictionary of sign descriptions for each letter
  const letterDescriptions = {
    'a': 'Closed fist with thumb alongside',
    'b': 'Hand flat, fingers together, thumb tucked',
    'c': 'Curved hand, like holding a C',
    'd': 'Index finger up, other fingers curled, thumb alongside',
    'e': 'Fingers curled, thumb tucked',
    'f': 'Index and thumb touching, other fingers extended',
    'g': 'Index finger and thumb extended like gun pointing sideways',
    'h': 'Index and middle fingers extended side by side',
    'i': 'Pinky finger extended, others curled',
    'j': 'Pinky extended, traced in J motion',
    'k': 'Index finger, middle finger and thumb extended',
    'l': 'Index finger and thumb extended in L shape',
    'm': 'Three fingers folded over thumb',
    'n': 'Two fingers folded over thumb',
    'o': 'Fingers curved into O shape',
    'p': 'Index finger pointing down, thumb and middle finger extended',
    'q': 'Index finger and thumb pointing down',
    'r': 'Crossed fingers',
    's': 'Closed fist, thumb over fingers',
    't': 'Index finger on thumb',
    'u': 'Index and middle finger extended together',
    'v': 'Index and middle finger extended in V shape',
    'w': 'Index, middle, and ring fingers extended',
    'x': 'Index finger bent at knuckle',
    'y': 'Thumb and pinky extended (hang loose)',
    'z': 'Index finger drawing Z in air',
    ' ': 'Brief pause',
  };

  // Define class names for the ASL alphabet
  const CLASS_NAMES = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'SPACE'
  ];

  // Function to load model only when needed
  const loadModelIfNeeded = async () => {
    // If model is already loaded or loading, don't do anything
    if (model || modelLoading) return true;
    
    setModelLoading(true);
    try {
      // Real, public TensorFlow.js model for ASL recognition
      // Note: For the purpose of this example, we'll use a mobilenet model that's publicly available
      // In a real application, you'd use a specialized ASL model
      const loadedModel = await tf.loadLayersModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/classification/5/default/1');
      setModel(loadedModel);
      setModelLoaded(true);
      setModelLoading(false);
      console.log('Model loaded successfully');
      return true;
    } catch (err) {
      console.error('Failed to load model:', err);
      setModelLoading(false);
      setError('Failed to load sign language recognition model. Please try again later.');
      return false;
    }
  };

  // Text to Sign Language translation
  const translateTextToSign = (inputText) => {
    if (!inputText) return;
    
    setIsLoading(true);
    try {
      // Convert text to lowercase for mapping
      const chars = inputText.toLowerCase().split("");
      
      // Create array of sign data for each character
      const signs = chars.map((char, index) => {
        return {
          id: index,
          char: char,
          description: letterDescriptions[char] || `No sign available for "${char}"`,
          image: letterImages[char] || null,
        };
      });
      
      setTranslatedSigns(signs);
      setIsLoading(false);
    } catch (err) {
      setError('Error translating text to sign language: ' + err.message);
      setIsLoading(false);
    }
  };

  // Use Tesseract.js to extract text from the uploaded image
  const extractTextFromImage = async (file) => {
    if (!file) {
      setError('No image file selected.');
      return;
    }
    
    setIsLoading(true);
    setRecognitionProgress(0);
    
    try {
      // Use Tesseract.js to extract text from the image
      const result = await Tesseract.recognize(
        URL.createObjectURL(file),
        'eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              setRecognitionProgress(m.progress * 100);
            }
          }
        }
      );
      
      // Extract the text
      const extractedText = result.data.text.trim();
      
      if (extractedText) {
        setExtractedText(extractedText);
        // Also convert the extracted text to sign language
        translateTextToSign(extractedText);
      } else {
        setError('No text could be extracted from the image. Try a clearer image.');
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Error extracting text from image: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setError('Please upload an image file.');
        return;
      }
      
      setExtractedText('');
      setTranslatedSigns([]);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      extractTextFromImage(file);
    }
  };

  // Handle text input for translation
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') {
      setError('Please enter some text to translate.');
      return;
    }
    translateTextToSign(text);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Function to check if an image exists
  const ImageWithFallback = ({ src, alt, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    
    const onError = () => {
      if (!hasError) {
        setHasError(true);
        setImgSrc('/asl_images/placeholder.png'); // Fallback image
      }
    };
    
    return <img src={imgSrc} alt={alt} onError={onError} {...props} />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-teal-50">
      <h1 className="text-4xl font-bold mb-8 text-teal-800">Sign Language Translator</h1>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-white rounded-lg shadow-md w-full max-w-lg">
        <button 
          onClick={() => setActiveTab('textToSign')}
          className={`px-6 py-3 w-1/2 ${activeTab === 'textToSign' ? 'bg-teal-500 text-white' : 'bg-white text-teal-700'} rounded-l-lg font-medium transition-colors`}
          style={activeTab === 'textToSign' ? { backgroundColor: '#53AAA1' } : {}}
        >
          Text to Sign
        </button>
        <button 
          onClick={() => setActiveTab('signToText')}
          className={`px-6 py-3 w-1/2 ${activeTab === 'signToText' ? 'bg-teal-500 text-white' : 'bg-white text-teal-700'} rounded-r-lg font-medium transition-colors`}
          style={activeTab === 'signToText' ? { backgroundColor: '#53AAA1' } : {}}
        >
          Image to Sign
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="w-full max-w-lg mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            className="text-red-500 underline mt-2 text-sm"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Text to Sign Language Tab */}
      {activeTab === 'textToSign' && (
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleTextSubmit} className="mb-4">
            <label className="block text-teal-800 text-sm font-bold mb-2">
              Enter text to translate:
            </label>
            <textarea
              className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-300"
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something here..."
            />
            <button 
              type="submit" 
              className="mt-4 text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors"
              style={{ backgroundColor: '#53AAA1' }}
              disabled={isLoading}
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </form>
          
          {/* Translation Result - Visual Sign Representation with Images */}
          {translatedSigns.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-teal-800 mb-2">Sign Language Translation:</h3>
              <div className="flex flex-wrap gap-3 bg-teal-50 p-4 rounded-md">
                {translatedSigns.map((sign) => (
                  <div key={sign.id} className="flex flex-col items-center p-2">
                    {sign.image ? (
                      <div className="w-20 h-20 flex items-center justify-center bg-white rounded-md shadow-sm overflow-hidden">
                        <ImageWithFallback 
                          src={sign.image} 
                          alt={`ASL sign for ${sign.char}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-teal-100 rounded-md shadow-sm">
                        <span className="text-2xl font-bold text-teal-800">{sign.char}</span>
                      </div>
                    )}
                    <div className="w-24 mt-2">
                      <span className="text-xs text-teal-700 text-center block">
                        {sign.char === ' ' ? 'Space' : sign.char.toUpperCase()}
                      </span>
                      <span className="text-xs text-teal-600 text-center block mt-1">
                        {sign.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-teal-600">
                <p className="font-medium">Instructions:</p>
                <p>To sign this message, form each hand sign in sequence. Space between words is indicated by a brief pause.</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Image to Sign Tab */}
      {activeTab === 'signToText' && (
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-teal-800 mb-4">Upload an image with text:</h3>
            
            <div 
              onClick={triggerFileInput}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-teal-200 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
            >
              <svg className="h-12 w-12 text-teal-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-teal-700 mb-1">Click to upload an image with text</span>
              <span className="text-xs text-teal-500">PNG, JPG, GIF up to 10MB</span>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <p className="mt-3 text-xs text-teal-500 text-center">
              The app will extract text from your image and convert it to sign language
            </p>
          </div>
          
          {/* Preview and Result */}
          {image && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-teal-800 mb-2">Uploaded Image:</h3>
              <div className="bg-teal-50 p-4 rounded-md flex justify-center">
                <img src={image} alt="Uploaded image with text" className="max-w-full max-h-64 object-contain rounded-md" />
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center my-6">
              <div className="relative w-full max-w-md">
                <div className="h-2 w-full bg-teal-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-300" 
                    style={{ width: `${recognitionProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-center text-sm text-teal-500">
                  Extracting text from image... {Math.round(recognitionProgress)}%
                </div>
              </div>
            </div>
          )}
          
          {extractedText && !isLoading && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-teal-800 mb-2">Extracted Text:</h3>
              <div className="bg-teal-50 p-4 rounded-md">
                <p className="text-teal-800">{extractedText}</p>
              </div>
              
              {/* Show the sign language translation of the extracted text */}
              {translatedSigns.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-teal-800 mb-2">Sign Language Translation:</h3>
                  <div className="flex flex-wrap gap-3 bg-teal-50 p-4 rounded-md">
                    {translatedSigns.map((sign) => (
                      <div key={sign.id} className="flex flex-col items-center p-2">
                        {sign.image ? (
                          <div className="w-20 h-20 flex items-center justify-center bg-white rounded-md shadow-sm overflow-hidden">
                            <ImageWithFallback 
                              src={sign.image} 
                              alt={`ASL sign for ${sign.char}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center bg-teal-100 rounded-md shadow-sm">
                            <span className="text-2xl font-bold text-teal-800">{sign.char}</span>
                          </div>
                        )}
                        <div className="w-24 mt-2">
                          <span className="text-xs text-teal-700 text-center block">
                            {sign.char === ' ' ? 'Space' : sign.char.toUpperCase()}
                          </span>
                          <span className="text-xs text-teal-600 text-center block mt-1">
                            {sign.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="w-full max-w-lg mt-8 bg-teal-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-teal-800 mb-2">How to use this translator</h3>
        <ul className="text-sm text-teal-700 list-disc pl-5 space-y-1">
          <li>For Text to Sign: Type any text and click "Translate" to see the corresponding ASL sign images.</li>
          <li>For Image to Sign: Upload an image containing text. The app will extract the text and convert it to sign language.</li>
          <li>For best results with text extraction, ensure the text in the image is clear and readable.</li>
          <li>The app recognizes standard English characters and converts them to American Sign Language (ASL).</li>
        </ul>
      </div>
      
      <footer className="mt-12 text-center text-teal-600 text-sm">
        <p>© 2025 SignGuide | Helping bridge communication gaps</p>
      </footer>
    </div>
  );
};

export default SignLanguageTranslator;