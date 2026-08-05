import { useEffect, useState } from "react";
import "./css/common.css"
import { useExplorer } from "../ExplorerContext";

function PermissionsEdit({ itemToEditUserPermissionsOf, setItemToEditUserPermissionsOf }) {
  const { editUserPermissionsForItemInMyFiles, getUsersWithPermissionsForItemInMyFiles } = useExplorer();

  const [newPermissionsInfo, setNewPermissionsInfo] = useState({
    usernameOrEmail: "",
    permissionString: "VIEWER"
  })
  
  const [usersWithPermissionsForItem, setUsersWithPermissionsForItem] = useState(new Map);

  useEffect(() => {
    async function loadUsersWithPermissionsForItem() { 
      setUsersWithPermissionsForItem(await getUsersWithPermissionsForItemInMyFiles(itemToEditUserPermissionsOf));
    }
    loadUsersWithPermissionsForItem();
  }, [itemToEditUserPermissionsOf, getUsersWithPermissionsForItemInMyFiles])

  function cleanupPermissionEditStates() {
    setItemToEditUserPermissionsOf(null);
    setNewPermissionsInfo({usernameOrEmail: "", permissionString: "VIEWER"});
    setUsersWithPermissionsForItem(new Map);
  }
  
  return (
    <div className="overlay" onClick={cleanupPermissionEditStates}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2> Edit permissions </h2>

        <div> Add new permission </div>
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
            let editPermissionData = await editUserPermissionsForItemInMyFiles(itemToEditUserPermissionsOf, newPermissionsInfo);
            setUsersWithPermissionsForItem(current => new Map(current).set(editPermissionData.username, editPermissionData.permission));
            setNewPermissionsInfo({usernameOrEmail: "", permissionString: "VIEWER"});
          }}> 
            Add 
        </button>

        <div> Existing permissions </div>
        { 
          usersWithPermissionsForItem &&
          // [...usersWithPermissionsForItem.entries()] returns and array of arrays [ [key1, value1], [key2, value2],... ]
          [...usersWithPermissionsForItem.entries()].map(([username, permission]) => (
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <span> {username} </span>
              { permission === "OWNER" && ("Owner") }
              {
                permission !== "OWNER" &&
                <select
                  value={permission}
                  onChange={async (e) => {
                    let editPermissionData = 
                      await editUserPermissionsForItemInMyFiles(itemToEditUserPermissionsOf, {
                        usernameOrEmail: username, permissionString: e.target.value
                      });
                    setUsersWithPermissionsForItem(current => new Map(current).set(editPermissionData.username, editPermissionData.permission));
                  }}   
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="SHARER">Sharer</option>
                  <option value="EDITOR">Editor</option>
                </select>
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
