import "./css/MainScreen.css"
import "./components/workspace/css/Workspace.css";
import "./components/workspace/pages/css/MyFiles.css";
import { useEffect, useState } from "react";
import { useExplorer } from "./context/ExplorerContext";
import { downloadDocumentRedirect } from "./common";
import useExplorerOperations from "./context/useExplorerOperations";
import PagesPanel from "./components/workspace/pages/PagesPanel";
import FileUpload from "./components/FileUpload";
import FolderUpload from "./components/FolderUpload";
import SearchBar from "./components/SearchBar";
import Breadcrumbs from "./components/Breadcrumbs";
import Workspace from "./components/workspace/Workspace";
import PermissionsEdit from "./components/workspace/PermissionsEdit";
import ContextMenu from "./components/workspace/ContextMenu";

function MainScreen() {
	const [currentPageIdx, setCurrentPageIdx] = useState(0);

	const { childrenIndex, setItemMap, setFilteredItemIdSet } = useExplorer();
	const { selectItem, patchItem, deleteItem } = useExplorerOperations(currentPageIdx);
	// React stores the state of state variables across renders, a render happens whenever the state changes
	// Render: a function call to the parent component (App() in this case)
	const [itemToEditUserPermissionsOf, setItemToEditUserPermissionsOf] = useState(null);
	const [draggedItem, setDraggedItem] = useState(null);
	const [contextMenu, setContextMenu] = useState({
		item: null,
		x: null,
		y: null,
	});
	const [itemRename, setItemRename] = useState({
		item: null,
		newName: null,
	});

	useEffect(() => {
		function exitRename() {
			setItemRename(null);
		}
		window.addEventListener("click", exitRename);
		window.addEventListener("contextmenu", exitRename);
		return () => {
			window.removeEventListener("click", exitRename);
			window.removeEventListener("contextmenu", exitRename);
		}
	}, []);

	function makeContextMenu(eventObject, item) {
		setContextMenu({
			item: item,
			x: eventObject.clientX,
			y: eventObject.clientY,
		});
	}

	function isDescendant(potentialDescendantItem, potentialAncestorItem) {
		if (potentialAncestorItem.type !== "FOLDER") return false;
		for (const child of childrenIndex.get(potentialAncestorItem.publicId) ?? []) {
			if (child.publicId === potentialDescendantItem.publicId) return true;
			if (child.type === "FOLDER" && isDescendant(potentialDescendantItem, child)) return true;
		}
		return false;
	}

	function canDropInto(destinationItem) {
		return (
			draggedItem &&
			destinationItem.type === "FOLDER" &&
			destinationItem.publicId !== draggedItem?.publicId &&
			destinationItem.publicId !== draggedItem?.publicParentId &&
			!(draggedItem.type === "FOLDER" && isDescendant(destinationItem, draggedItem)) /* deny cyclic relationship from dragging a folder into one of its' descendants */
		);
	}

	function renameDialogue(item) {
		return (
			<div
				onClick={(e) => e.stopPropagation()}
				onContextMenu={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
				style={{ zIndex: 1100, position: "relative" }}
			>
				<input
					autoFocus
					type="text"
					value={itemRename.newName}
					onChange={(e) => setItemRename({ item: item, newName: e.target.value })}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const newName = itemRename.newName.trim(); // trim spaces so that "  " or similar wouldn't be accepted
							if (newName) {
								patchItem(itemRename.item, newName, null);
								setItemRename(null);
							}
						}
					}}
				/>
			</div>
		)
	}

	function onSelect(e, item, isSearchResultItem) {
		e.stopPropagation();
		selectItem(item);
		if (isSearchResultItem) setFilteredItemIdSet(null);
	}

	/**
	 * Provides context menu logic, item renaming logic and item dragging logic
	 * @param {*} item 
	 * @param {*} displayItem 
	 * @returns JSX representing the item as defined by displayItem, or the rename dialogue if the item is being renamed
	 */
	function renderItemListing(item, displayItem, isSelectOnSingleClick = true, isDraggable = true, isSearchResultItem = false) {
		return (
			<div className="item-listing"
				onClick={isSelectOnSingleClick ? (e) => {
					onSelect(e, item, isSearchResultItem);
				} : undefined}
				onDoubleClick={!isSelectOnSingleClick ? (e) => {
					onSelect(e, item, isSearchResultItem);
				} : undefined}
				onContextMenu={(e) => {
					e.stopPropagation();
					e.preventDefault();
					makeContextMenu(e, item);
				}}

				draggable={isDraggable && !(itemRename?.item?.publicId === item.publicId)} // if item is being renamed dont let it be draggable
				onDragStart={() => setDraggedItem(item)}
				onDragEnd={() => setDraggedItem(null)}
				onDragOver={(e) => {
					e.preventDefault();
				}}
				onDrop={(e) => {
					e.preventDefault();
					e.stopPropagation();
					if (canDropInto(item)) {
						if (!item.isExpanded) {
							const itemTemp = { ...item, isExpanded: true };
							setItemMap((current) => new Map(current).set(item.publicId, itemTemp));
						}
						patchItem(draggedItem, null, item.publicId);
					}
				}}
			>
				{itemRename?.item?.publicId !== item.publicId && displayItem(item)}
				{itemRename?.item?.publicId === item.publicId && renameDialogue(item)}
			</div>
		);
	}
	return (
		<>
			<button onClick={() => {
				localStorage.removeItem("jwt");
				window.location.href = "/"    // reloads the page, which resets state variables and
																			// reruns const [isLoggedIn, setIsLoggedIn] = useState(token != null) to reset isLoggedIn accordingly
			}}>
				Logout
			</button>

			{
				contextMenu && contextMenu.item &&
				<ContextMenu
					contextMenu={contextMenu}
					setContextMenu={setContextMenu}
					onItemDownload={downloadDocumentRedirect}
					onItemDelete={deleteItem}
					onItemRename={(item) => {setItemRename({item: item, newName: item.name})}}
					onItemEditPermissions={(item) => {setItemToEditUserPermissionsOf(item)}}
				/>
			}
			{
				itemToEditUserPermissionsOf && 
				<PermissionsEdit
					itemToEditUserPermissionsOf={itemToEditUserPermissionsOf}
					setItemToEditUserPermissionsOf={setItemToEditUserPermissionsOf}
				/>
			}
			<div className="app-layout">
				<PagesPanel setCurrentPageIdx={setCurrentPageIdx} />
				<div className="app">
					<div className="ribbon">
						<FileUpload currentPageIdx={currentPageIdx} />
						<FolderUpload currentPageIdx={currentPageIdx} />
						<SearchBar 
							currentPageIdx={currentPageIdx} 
							draggedItem={draggedItem}
							renderItemListing={renderItemListing} />
					</div>

					<Breadcrumbs 
						currentPageIdx={currentPageIdx}
						renderItemListing={renderItemListing}
					/>

					<Workspace 
						currentPageIdx={currentPageIdx}
						draggedItem={draggedItem}
						renderItemListing={renderItemListing}
					/>
				</div>
			</div>
		</>
	)
}

export default MainScreen;
