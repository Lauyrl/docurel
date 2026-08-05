import { api } from "../api";

export function downloadDocumentRedirect(item) {
  /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
  window.open("http://localhost:8080/document/" + item.publicId + "/download");
}

export function uploadDocument(file, currentFolderId) {
  // uploading into current folder
  if (!file) return;

  const formData = new FormData(); // files sent to Spring as FormData
  formData.append("document", file); // name has to match the field name that Spring expects
  formData.append("publicParentId", currentFolderId);

  return api("/document", {
    method: "POST",
    body: formData,
  }).then((response) => response.json()); // response.json() doesnt return a json, but a 'Promise' that a json will be returned
}

// CHANGE THIS TO SEND RAW JSON
export function createFolder(foldername, currentFolderId) {
  const formData = new FormData();
  formData.append("foldername", foldername);
  formData.append("publicParentId", currentFolderId);

  return api("/folder", {
    method: "POST",
    body: formData,
  }).then((response) => response.json());
}

export function selectItem(item, ifIsDocument, ifIsFolder) {
  if (item.type === "DOCUMENT") ifIsDocument();
  if (item.type === "FOLDER") ifIsFolder();
}

export function deleteDescendants(next, rootFolder, childrenIndex) {
  if (rootFolder.type !== "FOLDER") return;
  for (const child of childrenIndex.get(rootFolder.publicId) ?? []) {
    deleteDescendants(next, child);
    next.delete(child.publicId);
  }
}

/**
 * Returns new itemMap with the specified items deleted.
 */
export async function deleteItem(item, itemMap, childrenIndex) {
  let next = new Map(itemMap);

  const type = item.type === "DOCUMENT" ? "document" : "folder";
  await api("/" + type + "/" + item.publicId, { method: "DELETE" });

  if (item.type === "FOLDER") deleteDescendants(next, item, childrenIndex);
  next.delete(item.publicId);

  return next;
}

export async function patchItem(item, newName, newParentPublicId) {
  if (newName === null && newParentPublicId === null) return null;

  try {
    await api("/item/" + item.publicId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        publicParentId: newParentPublicId,
      }),
    });
  } catch (error) {
    console.error(error);
    return null;
  }

  if (newParentPublicId == null) return { ...item, name: newName };
  else if (newName == null)
    return { ...item, publicParentId: newParentPublicId };
}

export function editUserPermissionsForItem(item, newPermissionsInfo) {
  return api("/item/" + item.publicId + "/permission", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPermissionsInfo),
  }).then((response) => response.json());
}

export async function getUsersWithPermissionsForItem(item) {
  let map = new Map();

  let users = await api("/item/" + item.publicId + "/permission").then((response) => response.json()) // should be a list of jsons
  for (const user of users) {
    map.set(user.username, user.permission);
  }
  
  return map;
}
