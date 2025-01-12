import React, { useState, useEffect } from "react";
import Title from "./components/Title";
import sideTreeLeft from "./assets/sideTreeLeft.png";
import sideTreeRight from "./assets/sideTreeRight.png";

const App: React.FC = () => {
   const [showStreamlit, setShowStreamlit] = useState(false);
   const [lastDetection, setLastDetection] = useState<string | null>(null);

   useEffect(() => {
      const fetchLastDetection = async () => {
         try {
            const response = await fetch(
               "http://172.17.73.20:8000/last-detection"
            );
            const data = await response.json();

            console.log("Fetched last detection:", data); // Log to see the response
            if (data.class) {
               setLastDetection(data.class); // Update with the last detection class
            } else {
               setLastDetection("No detection yet"); // Set default message if no class
            }
         } catch (error) {
            console.error("Error fetching last detection:", error);
            setLastDetection("Error fetching detection");
         }
      };

      // Fetch the last detection every 3 seconds
      const interval = setInterval(fetchLastDetection, 3000);

      // Cleanup on component unmount
      return () => clearInterval(interval);
   }, []);

   const handleAnalyzeClick = async () => {
      console.log("Analyze button clicked");
   
      try {
         const arResponse = await fetch("http://172.17.73.20:8000/area");
         const arData = await arResponse.json();
         console.log("Total area saved: ", arData, "ft^2");
         // Fetch text detection from the backend
         const textResponse = await fetch("http://172.17.73.20:8000/text");
         const textData = await textResponse.json();
         console.log("Text detection result:", textData);
   
         // Fetch image detection from the backend
         const imageResponse = await fetch("http://172.17.73.20:8000/image");
         const imageData = await imageResponse.json();
         console.log("Image detection result:", imageData);
   
         // Display the results
         alert(
            `Analysis Complete:\n\nEnergy saved: ${arData.area || "N/A"}kg\n\nText Detection: ${textData.text || "No text detected"}\nImage Detection: ${
               imageData.img_data || "No image detected"
            }`
         );
      } catch (error) {
         console.error("Error during analysis:", error);
         alert("An error occurred while analyzing. Please try again.");
      }
   };

   return (
      <div id="root">
         {/* Left Tree 1 */}
         <img
            src={sideTreeRight}
            alt="Side Screen Tree"
            className="side-tree"
            id="left-tree-1"
         />

         {/* Central Content */}
         <div className="central-container">
            <Title />
            <p id="last-detection-text">Last Detection: {lastDetection}</p>
            <button
               onClick={() => setShowStreamlit(!showStreamlit)}
               className="toggle-button"
            >
               {showStreamlit ? "Hide Streamlit App" : "Show Streamlit App"}
            </button>
            <button onClick={handleAnalyzeClick} className="toggle-button">
               Analyze
            </button>
            {showStreamlit && (
               <iframe
                  src="http://172.17.73.20:8501"
                  title="Streamlit App"
                  className="streamlit-iframe"
               ></iframe>
            )}
         </div>

         {/* Right Tree 1 */}
         <img
            src={sideTreeLeft}
            alt="Side Screen Tree"
            className="side-tree"
            id="right-tree-1"
         />
      </div>
   );
};

export default App;
