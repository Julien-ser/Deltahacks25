import React, { useState, useEffect } from "react";
import Title from "./components/Title";
import sideTreeLeft from "./assets/sideTreeLeft.png";
import sideTreeRight from "./assets/sideTreeRight.png";
import flowerBlue from "./assets/flowerBlue.png";
import flowerPink from "./assets/flowerPink.png";
import flowerPurple from "./assets/flowerPurple.png";
import Sun from "./assets/Sun.png";
import Imagination from "./assets/Imagination.png";


// Function to parse and wrap **text** in <strong> tags for bolding
const parseText = (text: string) => {
   return text
     .replace(/#/g, '') // Remove all '#' symbols
     .split('**')
     .map((part, index) => {
       if (index % 2 !== 0) {
         return <strong key={index}>{part}</strong>;
       }
       return part;
     });
};


const App: React.FC = () => {
   const [showStreamlit, setShowStreamlit] = useState(false);
   const [lastDetection, setLastDetection] = useState<string | null>(null);
   const [analysisResults, setAnalysisResults] = useState<any>(null);
   const [showAnalysis, setShowAnalysis] = useState(true); // State to manage the visibility of analysis results
   const [isScanning, setIsScanning] = useState(false); // State to track scanning/loading status

   useEffect(() => {
      const fetchLastDetection = async () => {
         try {
            const response = await fetch("http://172.17.73.20:8000/last-detection");
            const data = await response.json();
            if (data.class) {
               setLastDetection(data.class);
            } else {
               setLastDetection("No detection yet");
            }
         } catch (error) {
            setLastDetection("Error fetching detection");
         }
      };

      const interval = setInterval(fetchLastDetection, 3000);
      return () => clearInterval(interval);
   }, []);

   const handleAnalyzeClick = async () => {
      setIsScanning(true); // Start scanning
      try {
         const arResponse = await fetch("http://172.17.73.20:8000/area");
         const arData = await arResponse.json();
         const textResponse = await fetch("http://172.17.73.20:8000/text");
         const textData = await textResponse.json();
         const imageResponse = await fetch("http://172.17.73.20:8000/image");
         const imageData = await imageResponse.json();

         setAnalysisResults({
            area: arData.area || "No area detected",
            text: textData.text || "No text detected",
            img_data: imageData.img_data || "No image detected",
            max: arData.max || "N/A",
            message: arData.message || "N/A",
         });
      } catch (error) {
         setAnalysisResults({
            area: "Error during analysis",
            text: "Error fetching text detection",
            img_data: "Error fetching image detection",
            max: "N/A",
            message: "N/A",
         });
      } finally {
         setIsScanning(false); // End scanning once analysis is done
      }
   };
            /*<button onClick={() => setShowStreamlit(!showStreamlit)} className="toggle-button">
               {showStreamlit ? "Hide Streamlit App" : "Show Streamlit App"}
            </button>
            {/* "Show/Hide Analysis" Button at the bottom }*/
/*            <div className="bottom-container">
               <button onClick={() => setShowAnalysis(!showAnalysis)} className="toggle-button">
                  {showAnalysis ? "Hide Analysis" : "Show Analysis"}
               </button>
            </div>*/ 
            /*{showStreamlit && (
               <iframe src="http://172.17.73.20:8501" title="Streamlit App" className="streamlit-iframe" />
            )}*/

   return (
      <>
         {/* Left Tree */}
         <div className="tree-wrapper" id="left-tree-wrapper">
            <img src={sideTreeRight} alt="Side Screen Tree" className="side-tree" id="left-tree-1" />
         </div>

                   {/* Sun */}
                   <div id="floating-image">
            <img src={Sun} alt="Sun" className="sun" />
         </div>


        
         {/* BlueFlower */}
         <div className="flower-wrapper" id="blue-flower-wrapper">
            <img src={flowerBlue} alt="Blue Flower" className="flower" id="blue-flower" />
         </div>

         {/* PinkFlower */}
         <div className="flower-wrapper" id="pink-flower-wrapper">
            <img src={flowerPink} alt="Pink Flower" className="flower" id="pink-flower" />
         </div>

         {/* PurpleFlower */}
         <div className="flower-wrapper" id="purple-flower-wrapper">
            <img src={flowerPurple} alt="Purple Flower" className="flower" id="purple-flower" />
         </div>

         {/* Imagination */}
         <div className="flower-wrapper" id="imagination-wrapper">
            <img src={Imagination} alt="Wild Flower" className="flower" id="imagination" />
         </div>


         {/* Central Content */}
         <div className="central-container">
            <Title />
            <p id="last-detection-text">Last Detection: {lastDetection}</p>
            
            <button 
               onClick={handleAnalyzeClick} 
               className="toggle-button" 
               disabled={isScanning} // Disable the button if scanning is in progress
            >
               {isScanning ? "Scanning..." : "Analyze"}
            </button>

               <iframe src="http://172.17.73.20:8501" title="Streamlit App" className="streamlit-iframe" />

            {/* Conditional rendering of the analysis results showAnalysis &&  */}
            <div className="analysis-results" style={{ height: '300px' }}>
   {analysisResults ? (
      <>
         <h3>Analysis Complete</h3>
         <ul>
            {/* Area */}
            {analysisResults.area && analysisResults.area.split('\n').map((line: string, index: number) => (
               <li className="listitem" key={`area-line-${index}`}>
                  {parseText(line)} Joules of Energy saved! <a href="https://www.canada.ca/en/environment-climate-change/services/environmental-indicators/solid-waste-diversion-disposal.html?utm_source=chatgpt.com">Where did we get this?</a>
               </li>
            ))}
            {analysisResults.message === "new" ? (
               <li className="listitem">New Record! 🎉</li>
            ) : analysisResults.message === "improved" ? (
               <li className="listitem">{analysisResults.max}% of the way to your MAX SCORE! 😊</li>
            )
            
            : (
               <li className="listitem">error</li>
            )}
            {/* Text Detection */}
            {analysisResults.text && analysisResults.text.split('\n').map((line: string, index: number) => (
               <li className="listitem" key={`text-line-${index}`}>
                  {parseText(line)}
               </li>
            ))}
            {/* Image Detection */}
            {analysisResults.img_data && analysisResults.img_data.split('\n').map((line: string, index: number) => (
               <li className="listitem" key={`img-data-line-${index}`}>
                  {parseText(line)}
               </li>
            ))}
         </ul>
      </>
   ) : (
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         <p>No results available</p> {/* You can use a placeholder like "No results available" */}
      </div>
   )}
</div>

            
         </div>

         {/* Right Tree */}
         <div className="tree-wrapper" id="right-tree-wrapper">
            <img src={sideTreeLeft} alt="Side Screen Tree" className="side-tree" id="right-tree-1" />
         </div>
      </>
   );
};

export default App;
