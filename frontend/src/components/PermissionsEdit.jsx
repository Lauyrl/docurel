import { useState } from "react";
import "./css/common.css"

function PermissionsEdit({ itemToEditUserPermissionsOf, setItemToEditUserPermissionsOf, onConfirmPermissions }) {
  const [newPermissionsInfo, setNewPermissionsInfo] = useState({
    usernameOrEmail: "",
    permissionString: ""
  })

  function cleanupPermissionEditStates() {
    setItemToEditUserPermissionsOf(null);
    setNewPermissionsInfo({usernameOrEmail: "", permissionString: ""});
  }

  return (
    <div className="overlay" onClick={cleanupPermissionEditStates}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div> Edit permissions </div>
        <input
          type="text"
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

        <div className="modal-buttons">
          <button onClick={cleanupPermissionEditStates}> 
            Cancel 
          </button>
          <button onClick={() => {
            if (newPermissionsInfo.usernameOrEmail.trim() === "") return;
            onConfirmPermissions(itemToEditUserPermissionsOf, newPermissionsInfo);
            cleanupPermissionEditStates();
          }}> 
            Confirm 
          </button>
        </div>
      </div>
    </div>  
  )
}

export default PermissionsEdit;
