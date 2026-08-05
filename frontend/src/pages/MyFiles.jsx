import "./css/MyFiles.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { ExplorerContext } from "../ExplorerContext";
import FileUpload from "../components/FileUpload";
import FolderUpload from "../components/FolderUpload";
import Workspace from "../components/Workspace"
import Breadcrumbs from "../components/Breadcrumbs";
import { createFolder, deleteItem, editUserPermissionsForItem, getUsersWithPermissionsForItem, patchItem, uploadDocument } from "./common";

function initializeFolderUIState(item) {
	return { ...item, isExpanded: false };
}

function MyFiles() {
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

	async function uploadDocumentInMyFiles(file) {
		let document = await uploadDocument(file, currentFolderId);
		setItemMap(current => new Map(current).set(document.publicId, document)); // implicit return
	}

	async function createFolderInMyFiles(foldername) {
		let folder = await createFolder(foldername, currentFolderId);
		if (folder.type === 'FOLDER') folder = initializeFolderUIState(folder);
		setItemMap(current => new Map(current).set(folder.publicId, folder))
	}

	function selectItemInMyFiles(item) {
		setPreviewItemId(null);
		if (item.type === "DOCUMENT") setPreviewItemId(item.publicId);
		if (item.type === "FOLDER") {
			const itemTemp = { ...item, isExpanded: !item.isExpanded };
			setItemMap(current => new Map(current).set(item.publicId, itemTemp)) // make new map with new entry to avoid mutating state
			setCurrentFolderId(item.publicId);
		}
	}

	async function deleteItemInMyFiles(item) {
		const newItemMap = await deleteItem(item, itemMap, childrenIndex);
		setItemMap(newItemMap);
		selectItemInMyFiles(newItemMap.get(item.publicParentId)); // avoid itemMap.get() since itemMap could be stale? 
	}

	async function patchItemInMyFiles(item, newName, newParentPublicId) {
		let patchedItem = await patchItem(item, newName, newParentPublicId);
		if (patchedItem != null) {
			setItemMap(current => new Map(current).set(item.publicId, patchedItem));
		}
	}

	async function editUserPermissionsForItemInMyFiles(item, newPermissionsInfo) {
		return await editUserPermissionsForItem(item, newPermissionsInfo);
	}

	async function getUsersWithPermissionsForItemInMyFiles(item) {
		return await getUsersWithPermissionsForItem(item);
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

				uploadDocumentInMyFiles, createFolderInMyFiles, selectItemInMyFiles, deleteItemInMyFiles, patchItemInMyFiles,
				editUserPermissionsForItemInMyFiles, getUsersWithPermissionsForItemInMyFiles,

				getItem
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
