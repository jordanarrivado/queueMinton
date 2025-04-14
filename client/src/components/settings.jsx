import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
import fbColor from "../images/fbColor.png";
import greenSet from "../images/green.png";
import parrotGreen from "../images/parrotGreen.png";
import instaFeed from "../images/InstaFeed.png";
import teal from "../images/teal.png";
import lavander from "../images/lavander.png";
import park from "../images/park.png";
import purple from "../images/purple.png";

const themes = [
  { img: fbColor, name: "Facebook Theme" },
  { img: greenSet, name: "Green Theme" },
  { img: parrotGreen, name: "Parrot Green Theme" },
  { img: teal, name: "Teal Theme" },
  { img: instaFeed, name: "Instagram Theme" },
  { img: lavander, name: "Lavender Theme" },
  { img: park, name: "Park Theme" },
  { img: purple, name: "Purple Theme" },
];

const Settings = () => {
  const [customizeColor, setCustomizeColor] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const handleCustomClick = () => {
    setCustomizeColor((prev) => !prev);
  };

  const selectTheme = (themeName) => {
    setSelectedTheme(themeName);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-section">
        <h4 className="settings-subtitle">Customize Themes</h4>
        <button className="toggle-btn" onClick={handleCustomClick}>
          {customizeColor ? "Hide Themes" : "Customize Themes"}{" "}
          {customizeColor ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {customizeColor && (
          <div className="theme-container">
            {themes.map((theme, index) => (
              <div
                key={index}
                className={`theme-card ${selectedTheme === theme.name ? "selected" : ""}`}
                onClick={() => selectTheme(theme.name)}
              >
                <img src={theme.img} alt={theme.name} className="theme-image" />
                <p className="theme-name">{theme.name}</p>
                {selectedTheme === theme.name && <FaCheckCircle className="check-icon" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
