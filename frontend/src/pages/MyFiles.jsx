import "./css/MyFiles.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { ExplorerContext } from "../ExplorerContext";
import FileUpload from "../components/FileUpload";
import FolderUpload from "../components/FolderUpload";
import Workspace from "../components/Workspace"
import Breadcrumbs from "../components/Breadcrumbs";

function initializeFolderUIState(item) {
    return { ...item, isExpanded: false };
}

function MyFiles() {
  // Creates a *state* variable with the initial value null, and a function to update that variable
	// React stores the state of state variables across renders, a render happens whenever the state changes
	// Render: a function call to the parent component (App() in this case)
	const [itemMap, setItemMap] = useState(new Map);
	const [rootId, setRootId] = useState(null);
	const [currentFolderId, setCurrentFolderId] = useState(null);
	const [previewItemId, setPreviewItemId] = useState(null);

	// eslint-disable-next-line react-hooks/preserve-manual-memoization
	const childrenIndex = useMemo(() => {
		const index = new Map();
		for (const item of itemMap.values()) {
			if (!index.has(item.publicParentId)) index.set(item.publicParentId, []);
			index.get(item.publicParentId).push(item);
		}
		return index;
	}, [itemMap]);

	// () contains the parameters
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
	}, []);

	function uploadDocument(file) {
		if (!file) return;

		const formData = new FormData();   // files sent to Spring as FormData
		formData.append("document", file); // name has to match the field name that Spring expects
		formData.append("publicParentId", currentFolderId);

		api("/document", {
			method: "POST",
			body: formData
		})
			.then((response) => response.json()) // response.json() doesnt return a json, but a 'Promise' that a json will be returned
			.then((item) => {
				setItemMap(current => new Map(current).set(item.publicId, item)); // implicit return
			});
	}

	function selectItem(item) {
		setPreviewItemId(null);
		if (item.type === "DOCUMENT") setPreviewItemId(item.publicId);
		if (item.type === "FOLDER") {
			const itemTemp = { ...item, isExpanded: !item.isExpanded };
			setItemMap(current => new Map(current).set(item.publicId, itemTemp)) // make new map with new entry to avoid mutating state
			setCurrentFolderId(item.publicId);
		}
	}

	// CHANGE THIS TO SEND RAW JSON
	function createFolder(foldername) {
		const formData = new FormData();
		formData.append("foldername", foldername);
		formData.append("publicParentId", currentFolderId);

		api("/folder", {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((item) => {
				if (item.type === 'FOLDER') item = initializeFolderUIState(item);
				setItemMap(current => new Map(current).set(item.publicId, item))
			});
	}

	function deleteDescendants(next, rootFolder) {
		if (rootFolder.type !== "FOLDER") return;
		for (const child of (childrenIndex.get(rootFolder.publicId) ?? [])) {
			deleteDescendants(next, child);
			next.delete(child.publicId);
		}
	}

	function deleteItem(item) {
		const type = (item.type === "DOCUMENT" ? "document" : "folder");
		api("/" + type + "/" + item.publicId, { method: "DELETE" })
			.then(() => {
				let next = new Map(itemMap);
				if (item.type === "FOLDER") deleteDescendants(next, item);
				setItemMap(() => {
					next.delete(item.publicId);
					return next;
				});

				selectItem(itemMap.get(item.publicParentId));
			});
	}

	function patchItem(item, newName, newParentPublicId) {
		api("/item/" + item.publicId, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: newName,
				publicParentId: newParentPublicId
			})
		})
			.then(response => {
				if (response.status !== 204) return null;
				setItemMap(current => {
					if (newParentPublicId == null) return new Map(current).set(item.publicId, { ...item, name: newName })
					else if (newName == null) return new Map(current).set(item.publicId, { ...item, publicParentId: newParentPublicId })
				});
			});
	}

  function editUserPermissionsForItem(item, newPermissionsInfo) {
    api("/item/" + item.publicId + "/permission", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPermissionsInfo)
    })
  }

	function getItem(publicId) { return itemMap.get(publicId); }
	const root = getItem(rootId);
	const currentFolder = getItem(currentFolderId);
	const previewItem = getItem(previewItemId);

	return (
		<ExplorerContext.Provider
			value={{
				childrenIndex, root, currentFolder, previewItem,
				setRootId, setCurrentFolderId, setPreviewItemId,
				uploadDocument, selectItem, deleteItem, patchItem, editUserPermissionsForItem,
				getItem, createFolder
			}}
		>
			<div className="app">
				<div className="ribbon">
					<FileUpload />
					<FolderUpload />
				</div>

				<Breadcrumbs />
				<Workspace />
			</div>
		</ExplorerContext.Provider>
	);
}

export default MyFiles;
