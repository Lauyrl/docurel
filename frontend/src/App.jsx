import { useState } from "react";
import { ExplorerProvider } from "./context/ExplorerProvider";
import AuthScreen from "./AuthScreen";
import MainScreen from "./MainScreen";

function App() {
  const token = localStorage.getItem("jwt")
  const [isLoggedIn, setIsLoggedIn] = useState(token != null)

  return (
    <>
      { !isLoggedIn ? 
          <AuthScreen setIsLoggedIn={setIsLoggedIn} /> : <ExplorerProvider> <MainScreen /> </ExplorerProvider>}
    </>
  )
}

export default App;
