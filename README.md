Toggle Preview: Ctrl+Shift+V

### File Storage 
- All files are stored on the same level in the physical directory, and the folder hierarchy is logically maintained in the DB via a parent_id column 
  - This relieves the backend of directory-related operations (creation, relocation, navigation,...)
  - To avoid name collisions within this structure, stored files are named as their ID in the DB 

### Sharing and Permissions
- Items inherit the nearest permissions among itself or its' ancestors for the current user
- Revoking/deleting permissions on an item also revokes permissions on all of its' descendants
- Uploading items into another user's file tree gives them OWNER permissions, while the uploader becomes an EDITOR 
- Users can only move items they own 
- Users can only rename/delete children, add new items, or move items into a folder if they have EDITOR permissions, 
  or higher, to it
- Only OWNERs can view or manage outward permissions for an item they own
