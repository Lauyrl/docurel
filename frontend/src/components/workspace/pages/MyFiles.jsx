import "./css/MyFiles.css";
import { useEffect, useState } from "react";
import { api } from "../../../api";
import ItemTreeView from "./components/ItemTreeView";
import FolderContentsView from "./components/FolderContentsView";
import { useExplorer } from "../../../context/ExplorerContext";
import { initializeFolderUIState } from "../../../context/useExplorerOperations";


function MyFiles({ draggedItem, renderItemListing }) {
	const { itemMap, childrenIndex, currentFolder, setItemMap, setCurrentFolderId, rebuildNavigationStacks } = useExplorer();

	const [rootId, setRootId] = useState(null);
	// [] contains dependencies to 'watch'
	useEffect(() => {
			api("/document").then(response => response.json()).then((items) => {
				const itemMapTemp = new Map;
				let rootId = null;

				items.forEach(item => {
					if (item.type === "FOLDER") item = initializeFolderUIState(item);
					if (item.userRoot) {
						rootId = item.publicId
						setRootId(item.publicId);
						setCurrentFolderId(item.publicId);
					}
					itemMapTemp.set(item.publicId, item)
				})
				setItemMap(itemMapTemp);
				rebuildNavigationStacks(rootId);
			})
	}, []);

	if (!currentFolder) return;

	const root = itemMap.get(rootId);
	const currentFolderChildren = (childrenIndex.get(currentFolder?.publicId) ?? []);

	return (
		<>
			<ItemTreeView
				root={root}
				draggedItem={draggedItem}
				renderItemListing={renderItemListing}
			/>
			<FolderContentsView
				currentPageIdx={0}
				currentFolderChildren={currentFolderChildren}
				draggedItem={draggedItem}
				renderItemListing={renderItemListing}
			/>
		</>
	);
}

export default MyFiles;
