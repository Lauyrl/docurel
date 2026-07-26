Toggle Preview: Ctrl+Shift+V

### File Storage 
- All files are stored on the same level in the physical directory, and the folder hierarchy is logically maintained in the DB via a parent_id column 
  - This relieves the backend of directory-related operations (creation, relocation, navigation,...)
  - To avoid name collisions within this structure, stored files are named as their ID in the DB 
