Toggle Preview: Ctrl+Shift+V

### File Storage 
- All files are stored on the same level in the physical directory, and the folder hierarchy is logically maintained in the DB via a parent_id column 
  - This relieves the backend of directory-related operations (creation, relocation, navigation,...)
  - To avoid name collisions within this structure, stored files are named as their ID in the DB 

### Sharing and Permissions
- Items inherit the highest-level permissions among itself or its' ancestors for the current user
- Users can unconditionally delete or move an item if they have OWNER permissions to it, 
  otherwise, they need EDITOR permissions, or higher, to the *parent* of that item to do so
- Users can only add new items, or move items into a folder if they have EDITOR permissions, 
  or higher, to it
- Users can rename any item they have EDITOR permissions, or higher, to  
- Only OWNERs can view or manage outward permissions for an item they own
