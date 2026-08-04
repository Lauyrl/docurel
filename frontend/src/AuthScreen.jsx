import "./css/AuthScreen.css"
import { useState } from "react";
import { api } from "./api";

function AuthScreen({ setIsLoggedIn }) {
  const [isRegister, setIsRegister] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [isLogin, setIsLogin] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    usernameOrEmail: "",
    password: ""
  });
  
  function resetState() {
    setIsRegister(false);
    setIsLogin(false);
  }

  function registerUser() {
    api("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerInfo)
    })
      .then(response => response.json())
      .then(json => {
        localStorage.setItem("jwt", json.jwtToken);
        setIsLoggedIn(true);
      });
  }

  function loginUser() {
    api("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginInfo)
    })
      .then(response => response.json())
      .then(json => {
        localStorage.setItem("jwt", json.jwtToken);
        setIsLoggedIn(true);
      });
  }

  return (
    <div className="auth-screen">
      <h1> Docurel </h1>
      <button onClick={(e) => {
        e.stopPropagation();
        setIsRegister(true)
      }}> 
        Register a new account 
      </button>
      <button onClick={(e) => {
        e.stopPropagation();
        setIsLogin(true)
      }}> 
        Log into an existing account 
      </button>
      
      { 
        isRegister && (
        <div className="auth-form-overlay" onClick={resetState}>
          <div className="auth-form" onClick={(e) => {e.stopPropagation()}}>
            <input 
              type="text"
              placeholder="Enter username"
              onClick={(e) => {e.stopPropagation()}}
              onChange={(e) => {setRegisterInfo({...registerInfo, username: e.target.value})}}
            />
            <input 
              type="text"
              placeholder="Enter email"
              onClick={(e) => {e.stopPropagation()}}
              onChange={(e) => {setRegisterInfo({...registerInfo, email: e.target.value})}}
            />
            <input 
              type="text"
              placeholder="Enter email"
              onClick={(e) => {e.stopPropagation()}}
              onChange={(e) => {setRegisterInfo({...registerInfo, password: e.target.value})}}
            />
            <button onClick={registerUser}> Confirm </button>
          </div>
        </div>
        )
      }
      { 
        isLogin && (
        <div className="auth-form-overlay" onClick={resetState}>
          <div className="auth-form" onClick={(e) => {e.stopPropagation()}}>
            <input 
              type="text"
              placeholder="Enter username or email"
              onClick={(e) => {e.stopPropagation()}}
              onChange={(e) => {setLoginInfo({...loginInfo, usernameOrEmail: e.target.value})}}
            />
            <input 
              type="text"
              placeholder="Enter password"
              onClick={(e) => {e.stopPropagation()}}
              onChange={(e) => {setLoginInfo({...loginInfo, password: e.target.value})}}
            />
            <button onClick={loginUser}> Confirm </button>
          </div>
        </div>
        )
      }
    </div>
  );
}

export default AuthScreen;
