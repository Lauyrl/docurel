import { useState } from "react";
import "./css/MainScreen.css"
import "./pages/css/MyFiles.css";
import PagesPanel from "./pages/PagesPanel";
import FileUpload from "./components/FileUpload";
import FolderUpload from "./components/FolderUpload";
import Breadcrumbs from "./components/Breadcrumbs";
import Workspace from "./components/Workspace";
import { ExplorerProvider } from "./context/ExplorerProvider";

function MainScreen() {
	// React stores the state of state variables across renders, a render happens whenever the state changes
	// Render: a function call to the parent component (App() in this case)
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
						
			<ExplorerProvider>
				<div className="app-layout">
					<PagesPanel setCurrentPageIdx={setCurrentPageIdx} />
					<div className="app">
						<div className="ribbon">
							<FileUpload currentPageIdx={currentPageIdx}/>
							<FolderUpload currentPageIdx={currentPageIdx}/>
						</div>

						<Breadcrumbs currentPageIdx={currentPageIdx}/>
						<Workspace currentPageIdx={currentPageIdx} />
					</div>
				</div>
			</ExplorerProvider>
		</>
	)
}

export default MainScreen;
