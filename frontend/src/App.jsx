import { useState } from "react";
import AuthScreen from "./AuthScreen";
import MainScreen from "./MainScreen";

function App() {
  const [token, setToken] = useState(null);
  return (
    <>
      { !token ? 
          <AuthScreen setToken={setToken} /> : <MainScreen token={token} /> }
    </>
  )
}

export default App;
