import { api } from "./api";

export async function downloadDocumentRedirect(item) {
  const blob = await api("/document/" + item.publicId + "/download").then(response => response.blob()); // extract byte[] from response
  const url = URL.createObjectURL(blob); // browser temp url for blob

  const a = document.createElement("a"); // simulate an element <a />
  a.href = url;                          // <a href={url}/>
  a.download = item.name;                // <a href={url} download={item.name}/>: tells the browser that the link should trigger a download
  a.click();                             // simulate clicking the link

  URL.revokeObjectURL(url);
}

export function uploadDocumentCommon(file, currentFolderId) {
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
export function createFolderCommon(foldername, currentFolderId) {
  const formData = new FormData();
  formData.append("foldername", foldername);
  formData.append("publicParentId", currentFolderId);

  return api("/folder", {
    method: "POST",
    body: formData,
  }).then((response) => response.json());
}

function deleteDescendants(next, rootFolder, childrenIndex) {
  if (rootFolder.type !== "FOLDER") return;
  for (const child of childrenIndex.get(rootFolder.publicId) ?? []) {
    deleteDescendants(next, child, childrenIndex);
    next.delete(child.publicId);
  }
}

/**
 * Returns new itemMap with the specified items deleted.
 */
export async function deleteItemCommon(item, itemMap, childrenIndex) {
  let next = new Map(itemMap);

  const type = item.type === "DOCUMENT" ? "document" : "folder";
  await api("/" + type + "/" + item.publicId, { method: "DELETE" });

  if (item.type === "FOLDER") deleteDescendants(next, item, childrenIndex);
  next.delete(item.publicId);

  return next;
}

export async function patchItemCommon(item, newName, newParentPublicId) {
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

export function editUserPermissionsForItemCommon(item, newPermissionsInfo) {
  return api("/item/" + item.publicId + "/permission", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPermissionsInfo),
  }).then((response) => response.json());
}

export function deleteUserPermissionsForItemCommon(item, username) {
  return api("/item/" + item.publicId + "/permission", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  })
}

export async function getUsersWithPermissionsForItemCommon(item) {
  let map = new Map();

  let users = await api("/item/" + item.publicId + "/permission").then((response) => response.json()) // should be a list of jsons
  for (const user of users) {
    map.set(user.username, user.permission);
  }
  
  return map;
}

export async function searchItemsCommon(
    ownedOnly,
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
  let url = "/item/search?";
  url += "ownedOnly=" + ownedOnly;
  // dont add null string params since encodeURIComponent(null) evaluates to "null" instead of leaving empty
  if (searchQuery)   url += "&query=" + encodeURIComponent(searchQuery); 
  if (type)          url += "&type="  + encodeURIComponent(type);
  if (contentType)   url += "&contentType="   + encodeURIComponent(contentType);
  if (createdAfter)  url += "&createdAfter="  + encodeURIComponent(new Date(createdAfter).toISOString());
  if (createdBefore) url += "&createdBefore=" + encodeURIComponent(new Date(createdBefore).toISOString());
  if (updatedAfter)  url += "&updatedAfter="  + encodeURIComponent(new Date(updatedAfter).toISOString());
  if (updatedBefore) url += "&updatedBefore=" + encodeURIComponent(new Date(updatedBefore).toISOString());
  if (!sortBy) sortBy = "Name similarity";
  url += "&sortBy=" + encodeURIComponent(sortBy);
  url += "&descending=" + encodeURIComponent(descending);
  return api(url).then(response => response.json());
}

export function formatFileSize(bytes) {
  if (bytes == null) return "";

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = bytes;
  let unitIdx = 0;

  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024;
    unitIdx++;
  }

  return size.toFixed(1) + " " + units[unitIdx];
}
