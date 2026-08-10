import { createFolderCommon, deleteItemCommon, deleteUserPermissionsForItemCommon, editUserPermissionsForItemCommon, getUsersWithPermissionsForItemCommon, patchItemCommon, registerOpenCommon, searchItemsCommon, uploadDocumentCommon } from "../common";
import { useExplorer } from "./ExplorerContext";

export function initializeFolderUIState(item) {
  return { ...item, isExpanded: false };
}

export default function useExplorerOperations(currentPageIdx) {
  const { itemMap, currentFolderId, childrenIndex, setItemMap, setCurrentFolderId, setPreviewItemId, rebuildNavigationStacks, setFilteredItemIdSet, filterValues } = useExplorer();

  function anyFilterActive() {
    return (filterValues.type || filterValues.contentType || filterValues.createdAfter || filterValues.createdBefore || filterValues.updatedAfter || filterValues.updatedBefore);
  }

  function selectItem(item) {
    setPreviewItemId(null);
    if (item.type === "DOCUMENT") setPreviewItemId(item.publicId);
    if (item.type === "FOLDER") {
      if (item.publicId !== currentFolderId) rebuildNavigationStacks(item.publicId);

      const itemTemp = { ...item, isExpanded: !item.isExpanded };
      setItemMap((current) => new Map(current).set(item.publicId, itemTemp)); // make new map with new entry to avoid mutating state
      setCurrentFolderId(item.publicId);
    }
  }

  async function uploadDocument(file) {
    let document = await uploadDocumentCommon(file, currentFolderId);
    setItemMap((current) => new Map(current).set(document.publicId, document)); // implicit return
  }

  async function createFolder(foldername) {
    let folder = await createFolderCommon(foldername, currentFolderId);
    if (folder.type === "FOLDER") folder = initializeFolderUIState(folder);
    setItemMap((current) => new Map(current).set(folder.publicId, folder));
  }

  async function deleteItem(item) {
    const newItemMap = await deleteItemCommon(item, itemMap, childrenIndex);
    setItemMap(newItemMap);
    selectItem(newItemMap.get(item.publicParentId)); // avoid itemMap.get() since itemMap could be stale?
  }

  async function patchItem(item, newName, newParentPublicId) {
    let patchedItem = await patchItemCommon(item, newName, newParentPublicId);
    if (patchedItem != null) {
      setItemMap((current) => new Map(current).set(item.publicId, patchedItem));
    }
  }

  async function editUserPermissionsForItem(item, newPermissionsInfo) {
    return await editUserPermissionsForItemCommon(item, newPermissionsInfo);
  }

  async function deleteUserPermissionsForItem(item, username) {
    deleteUserPermissionsForItemCommon(item, username)
  }

  async function getUsersWithPermissionsForItem(item) {
    return await getUsersWithPermissionsForItemCommon(item);
  }

  async function registerOpen(item) {
    registerOpenCommon(item);
  }

  async function searchItems(
    searchQuery, 
    type,
    contentType,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    sortBy,
    descending
  ) {
    const filteredItemsPublicId = await searchItemsCommon(
      (currentPageIdx === 0), 
      searchQuery, 
      type,
      contentType,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      sortBy,
      descending
    ); 
    setFilteredItemIdSet(new Set(filteredItemsPublicId));
  }

  return {
    initializeFolderUIState, anyFilterActive, selectItem, uploadDocument, createFolder, deleteItem, patchItem, 
    editUserPermissionsForItem, deleteUserPermissionsForItem, getUsersWithPermissionsForItem,
    registerOpen, searchItems,
  }
}
