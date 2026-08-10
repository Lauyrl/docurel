import "../css/common.css";
import { useEffect, useState } from "react";
import useExplorerOperations from "../context/useExplorerOperations";

function PermissionsEdit({ itemToEditUserPermissionsOf, setItemToEditUserPermissionsOf }) {
  const { editUserPermissionsForItem, getUsersWithPermissionsForItem, deleteUserPermissionsForItem } = useExplorerOperations(0);

  const [newPermissionsInfo, setNewPermissionsInfo] = useState({
    usernameOrEmail: "",
    permissionString: "VIEWER"
  })
  
  const [usersWithPermissionsForItem, setUsersWithPermissionsForItem] = useState(new Map); // key: username, value: permission

  useEffect(() => {
    async function loadUsersWithPermissionsForItem() { 
      setUsersWithPermissionsForItem(await getUsersWithPermissionsForItem(itemToEditUserPermissionsOf));
    }
    loadUsersWithPermissionsForItem();
  }, [itemToEditUserPermissionsOf])

  function cleanupPermissionEditStates() {
    setItemToEditUserPermissionsOf(null);
    setNewPermissionsInfo({usernameOrEmail: "", permissionString: "VIEWER"});
    setUsersWithPermissionsForItem(new Map);
  }
  
  return (
    <div className="overlay" onClick={cleanupPermissionEditStates}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2> Edit permissions </h2>

        <div style={{ textDecoration: "underline" }}> Add new permission </div>
        <input
          type="text"
          value={newPermissionsInfo.usernameOrEmail}
          placeholder="Enter user's name or email"
          onChange={(e) => setNewPermissionsInfo({...newPermissionsInfo, usernameOrEmail: e.target.value})}
        />
        <select
          value={newPermissionsInfo.permissionString}
          onChange={(e) => setNewPermissionsInfo({...newPermissionsInfo, permissionString: e.target.value})}
        >
          <option value="VIEWER">Viewer</option>
          <option value="SHARER">Sharer</option>
          <option value="EDITOR">Editor</option>
        </select>
        <button onClick={async () => {
            if (newPermissionsInfo.usernameOrEmail.trim() === "") return;
            let editPermissionData = await editUserPermissionsForItem(itemToEditUserPermissionsOf, newPermissionsInfo);
            setUsersWithPermissionsForItem(current => new Map(current).set(editPermissionData.username, editPermissionData.permission));
            setNewPermissionsInfo({usernameOrEmail: "", permissionString: "VIEWER"});
          }}> 
            Add 
        </button>

        <div style={{ textDecoration: "underline" }}> Existing permissions </div>
        { 
          usersWithPermissionsForItem &&
          // [...usersWithPermissionsForItem.entries()] returns and array of arrays [ [key1, value1], [key2, value2],... ]
          [...usersWithPermissionsForItem.entries()].map(([username, permission]) => (
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <span> {username} </span>
              { permission === "OWNER" && ("Owner") }
              {
                permission !== "OWNER" &&
                <span style={{ display: "flex", gap: "10px" }}>
                  <select
                    value={permission}
                    onChange={async (e) => {
                      let editPermissionData = 
                        await editUserPermissionsForItem(itemToEditUserPermissionsOf, {
                          usernameOrEmail: username, permissionString: e.target.value
                        });
                      setUsersWithPermissionsForItem(current => new Map(current).set(editPermissionData.username, editPermissionData.permission));
                    }}   
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="SHARER">Sharer</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <button 
                    style={{userSelect: "none"}} 
                    onClick={async () => {
                      await deleteUserPermissionsForItem(itemToEditUserPermissionsOf, username);
                      setUsersWithPermissionsForItem(current => {
                        let map = new Map(current);
                        map.delete(username);
                        return map;
                      })
                    }}
                  > 
                    ✕ 
                  </button>
                </span>
              }
            </div>
          )) 
        }
        <button onClick={cleanupPermissionEditStates}> 
          Done 
        </button>
      </div>
    </div>  
  )
}

export default PermissionsEdit;
