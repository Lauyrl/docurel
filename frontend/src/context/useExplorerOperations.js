import { useCallback } from "react";
import { createFolderCommon, deleteItemCommon, editUserPermissionsForItemCommon, getUsersWithPermissionsForItemCommon, patchItemCommon, uploadDocumentCommon } from "../common";
import { useExplorer } from "./ExplorerContext";

export function initializeFolderUIState(item) {
  return { ...item, isExpanded: false };
}

function useMyFilesOperations() {
  const { itemMap, currentFolderId, childrenIndex, setItemMap, setCurrentFolderId, setPreviewItemId, rebuildNavigationStacks } = useExplorer();  

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

  async function getUsersWithPermissionsForItem(item) {
    return await getUsersWithPermissionsForItemCommon(item);
  }

  return {
    initializeFolderUIState, selectItem, uploadDocument, createFolder, deleteItem, patchItem, editUserPermissionsForItem, getUsersWithPermissionsForItem
  }
}

function useSharedOperations() {
  const { itemMap, currentFolderId, childrenIndex, setItemMap, setCurrentFolderId, setPreviewItemId, rebuildNavigationStacks } = useExplorer();

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

  // useCallback prevents functions from being redefined on every re-render (useMyFilesOperations was re-rendering since it depended on values from useExplorer(), which were re-rendering because states were being updated) 
  const getUsersWithPermissionsForItem = useCallback(async (item) => {
    return await getUsersWithPermissionsForItemCommon(item);
  }, []);

  return {
    selectItem, uploadDocument, createFolder, deleteItem, patchItem, editUserPermissionsForItem, getUsersWithPermissionsForItem
  }
}

export default function useExplorerOperations(currentPageIdx) {
  const myFilesOperations = useMyFilesOperations()
  const sharedOperations = useSharedOperations()

  switch (currentPageIdx) {
    case 0: return myFilesOperations;
    case 1: return sharedOperations;
    default: throw new Error("Unknown page")
  }
}
