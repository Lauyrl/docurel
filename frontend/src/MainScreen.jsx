import { useState } from "react";
import "./css/MainScreen.css"
import MyFiles from "./pages/MyFiles";
import PagesPanel from "./pages/PagesPanel";

function MainScreen() {
	const [currentPageIdx, setCurrentPageIdx] = useState(0);

	return (
		<>
			<button onClick={() => {
          localStorage.removeItem("jwt");  
          window.location.href = "/"      // reloads the page, which resets state variables and
                                          // reruns const [isLoggedIn, setIsLoggedIn] = useState(token != null) to reset isLoggedIn accordingly
        }}>
          Logout
      </button>

			<div className="app-layout">
				<PagesPanel setCurrentPageIdx={setCurrentPageIdx}/>
				<div className="page-view">  
					{ currentPageIdx === 0 && <MyFiles /> }
					{ currentPageIdx === 1 && <MyFiles /> }
				</div>
			</div>
		</>
	)
}

export default MainScreen;
