import "./css/MyFiles.css";
import { useEffect, useState } from "react";
import { api } from "../../../api";
import ItemTreeView from "./components/ItemTreeView";
import FolderContentsView from "./components/FolderContentsView";
import { useExplorer } from "../../../context/ExplorerContext";
import { initializeFolderUIState } from "../../../context/useExplorerOperations";


function MyFiles({ draggedItem, renderItemListing }) {
	const { itemMap, setItemMap, setCurrentFolderId } = useExplorer();

	const [rootId, setRootId] = useState(null);
	// [] contains dependencies to 'watch'
	useEffect(() => {
		Promise.all([ // wraps multiple Promises (fetches return Promises) inside a composite Promise that only resolves when all its' members do
			          // .then() takes the result of a resolved Promise and returns another Promise
			api("/folder/root").then(response => response.json()),
			api("/document").then(response => response.json())
		]).then(([root, items]) => {
			const itemMapTemp = new Map;

			root = initializeFolderUIState(root);
			setRootId(root.publicId);
			setCurrentFolderId(root.publicId);
			itemMapTemp.set(root.publicId, root);

			items.forEach(item => { // non-inclusive of the user root, see backend
				if (item.type === "FOLDER") item = initializeFolderUIState(item);
				itemMapTemp.set(item.publicId, item)
			})
			setItemMap(itemMapTemp);
		})
	}, [setItemMap, setCurrentFolderId]);

	const root = itemMap.get(rootId);

	return (
		<>
			<ItemTreeView
				root={root}
				draggedItem={draggedItem}
				renderItemListing={renderItemListing}
			/>
			<FolderContentsView
				draggedItem={draggedItem}
				renderItemListing={renderItemListing}
			/>
		</>
	);
}

export default MyFiles;
