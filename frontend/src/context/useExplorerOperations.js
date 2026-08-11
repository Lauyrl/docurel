import { createFolderCommon, deleteItemCommon, deleteUserPermissionsForItemCommon, editUserPermissionsForItemCommon, getUsersWithPermissionsForItemCommon, patchItemCommon, registerOpenCommon, searchItemsCommon, uploadDocumentCommon } from "../common";
import { useExplorer } from "./ExplorerContext";

export function initializeFolderUIState(item) {
  return { ...item, isExpanded: false };
}

export default function useExplorerOperations(currentPageIdx) {
  const { itemMap, currentFolderId, childrenIndex, setItemMap, setCurrentFolderId, setPreviewItemId, rebuildNavigationStacks, setFilteredItemIdSet, filterValues, sortValues } = useExplorer();

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

  function filterAndSortItemsList(items, alwaysShowFolders = false) {
    const filtered = items.filter(item => {
      if (alwaysShowFolders && item.type === "FOLDER") return true;
      if (filterValues.type          && item.type !== filterValues.type) return false;
      if (filterValues.contentType   && item.contentType !== filterValues.contentType) return false;
      if (filterValues.createdAfter  && new Date(item.createdAt) < new Date(filterValues.createdAfter))  return false;
      if (filterValues.createdBefore && new Date(item.createdAt) > new Date(filterValues.createdBefore)) return false;
      if (filterValues.updatedAfter  && new Date(item.updatedAt) < new Date(filterValues.updatedAfter))  return false;
      if (filterValues.updatedBefore && new Date(item.updatedAt) > new Date(filterValues.updatedBefore)) return false;
      return true;
    });
    filtered.sort((a, b) => {
      let result;
      switch (sortValues.sortBy) {
        case "Alphabetical":
          result = a.name.localeCompare(b.name); break;
        case "Size":
          result = a.sizeBytes - b.sizeBytes; break;
        case "Date created":
          result = new Date(a.createdAt) - new Date(b.createdAt); break;
        case "Date updated":
          result = new Date(a.updatedAt) - new Date(b.updatedAt); break;
        default: result = a.name.localeCompare(b.name); break;
      }
      return sortValues.descending ? -result : result;
    });
    return filtered;
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
      searchQuery, 
      type,
      contentType,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      sortBy,
      descending,
      (currentPageIdx === 0),        // owned only, pg 0
      (currentPageIdx === 1)         // exclude owned, pg 1
    ); 
    setFilteredItemIdSet(new Set(filteredItemsPublicId));
  }

  return {
    initializeFolderUIState, filterAndSortItemsList, anyFilterActive, 
    selectItem, uploadDocument, createFolder, deleteItem, patchItem, 
    editUserPermissionsForItem, deleteUserPermissionsForItem, getUsersWithPermissionsForItem,
    registerOpen, searchItems,
  }
}
