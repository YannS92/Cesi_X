import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/error.css";

const Error = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleGoHome = () => {
    navigate("/profile");
  };

  const [languageData, setLanguageData]= useState({});

  useEffect (() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get("lang") || "fr";
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Let's try again buddy:", error);
      });
  }, [location.search]);

  return (
    <div className="error-page">
      <div className="error-container">
        <img src="/error-image.jpg" alt="Error" className="error-image" />
        <p> {languageData.unexpectedError|| 'An unexpected error occurred. Please try again.'} </p>
        <button onClick={handleGoHome} className="error-button">
          {languageData.profile || 'Profile'}
        </button>
      </div>
    </div>
  );
};

export default Error;
