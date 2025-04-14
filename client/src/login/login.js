import React from "react";
import Form from "./Form";
import Title from "./title";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./LoginRegister.css";
import Logo from "../components/icons/newLogo.png";

const LoginRegister = () => {
  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="headTitle">
        <img src={Logo} alt="App Logo" className="logo" />
        <Title />
      </div>

      {/* Form Section */}
      <div className="center-container">
        <Form />
      </div>
    </div>
  );
};

export default LoginRegister;
