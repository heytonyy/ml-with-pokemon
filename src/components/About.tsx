import { useState, useEffect, useRef } from "react";
import oak from "../assets/oak.png";

const dialogueTexts = [
  "Hello there! Welcome to the world of POKéMON!",
  "My name is TONY!",
  "People call me the POKéMON PROF!",
  "This world is inhabited by creatures called POKéMON!",
  "For some people, POKéMON are pets. Others use them for fights.",
  "Myself... I study machine learning with POKéMON as a passion!",
];

const About = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const typingRef = useRef(false);

  useEffect(() => {
    if (currentTextIndex < dialogueTexts.length && !typingRef.current) {
      typingRef.current = true;
      setIsTyping(true);
      setShowContinue(false);
      setDisplayedText("");

      const text = dialogueTexts[currentTextIndex];
      let charIndex = -1; // Start at -1
      let timeoutId: number;

      const typeText = () => {
        charIndex++; // Increment FIRST
        if (charIndex < text.length) {
          setDisplayedText((prev) => prev + text[charIndex]);
          timeoutId = setTimeout(typeText, 50); // Typing speed
        } else {
          setIsTyping(false);
          setShowContinue(true);
          typingRef.current = false;
        }
      };

      timeoutId = setTimeout(typeText, 300); // Initial delay

      // Cleanup function to prevent double execution
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        typingRef.current = false;
      };
    }
  }, [currentTextIndex]);

  useEffect(() => {
    const handleContinue = () => {
      if (currentTextIndex < dialogueTexts.length - 1) {
        setCurrentTextIndex((prev) => prev + 1);
      } else {
        // Reset to beginning or handle end
        setCurrentTextIndex(0);
      }
    };
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isTyping) {
          handleContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isTyping, currentTextIndex]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono bg-gray-100">
      <div className="w-full max-w-2xl bg-white border-8 border-black rounded-lg overflow-hidden shadow-2xl">
        {/* Main Game Area */}
        <div className="bg-green-50 relative">
          {/* Image/Character Display Area */}
          <div className="h-64 bg-gradient-to-b from-blue-200 via-blue-100 to-green-100 flex items-center justify-center relative">
            {/* Professor Oak Image */}
            <img 
              src={oak} 
              alt="Professor Oak" 
              className="w-32 h-48 object-contain"
            />
          </div>

          {/* Text Box */}
          <div className="bg-white border-t-4 border-black relative">
            <div className="p-6 min-h-32">
              <div className="text-lg leading-relaxed font-mono text-black">
                {displayedText}
                {isTyping && <span className="animate-pulse text-2xl">▎</span>}
              </div>

              {showContinue && (
                <div className="absolute bottom-4 right-6 animate-bounce">
                  <div className="text-black text-xl">▼</div>
                </div>
              )}
            </div>
          </div>

          {/* Controls hint */}
          <div className="bg-gray-800 text-green-400 text-center py-2 text-sm">
            Press SPACE or ENTER to continue
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;