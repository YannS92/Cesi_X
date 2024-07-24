import React, {  useState, useEffect } from "react";
import '../styles/depcom.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DepComercial = () => {
  const user = useSelector((state) => state.user?.user); // Assuming user details include role
  const [languageData, setLanguageData] = useState({});
  
  const navigate = useNavigate();
  const location= useLocation();

  useEffect(() => {
   
    const allowedRoles = ['chef service hse','responsable commercial']; // Define appropriate roles that can access
    if (!allowedRoles.includes(user?.role)) {
      navigate('/error'); // Redirect to the Error page
    }
  }, [user, navigate]);

  useEffect(() => {
    const searchParams= new URLSearchParams(location.search);
    const lang = searchParams.get('lang')||'fr';
    import(`../lang/${lang}.json`) 
    .then((data) =>{
        setLanguageData(data);
    })
    .catch((error)=> {
        console.error("Let's try again buddy:", error);

    });

},[location.search]);

  return (
    <div className="DepComercial-container">
      <h1 className="DepComercial-title"> {languageData.DepComercial || 'Département Commercial'} </h1>
      <iframe
        className="DepComercial-iframe"
        title="Rapport Power BI - Département Commercial"
        src="https://app.powerbi.com/view?r=eyJrIjoiZGVlMGJmNDEtYTk3NC00NGIxLThlNWEtOGJmZjM4ZTE3MzU5IiwidCI6ImI4NTY2MGE4LWZlN2YtNGYwOS05NTY0LTQwMjYxZDE2ODM4NCJ9"
        width="1140"
        height="541.25"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  );
};

export default DepComercial;