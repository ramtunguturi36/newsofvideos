# Multi-Select Delete Implementation Guide

## Overview
This document describes the implementation of multi-select delete functionality across all four content management areas:
- Picture Templates
- Video Content
- Audio Content
- Video+QR Templates

## Features
1. **Checkbox Selection**: Each item (folder/content) has a checkbox for selection
2. **Select All**: Quick toggle to select/deselect all items in the current view
3. **Visual Feedback**: Selected count displayed in header
4. **Bulk Delete Button**: Appears only when items are selected
5. **Confirmation Modal**: Shows detailed list of items to be deleted with cascade warnings
6. **Progress Indication**: Shows deletion progress for multiple items
7. **Error Handling**: Displays which items failed to delete while completing successful deletions

## UI/UX Design

### Selection Interface
- **Checkbox Position**: Top-left corner of each card (z-index: 20)
- **Select All Button**: Located above each section (folders/content)
- **Selected Count**: Displayed below the page title
- **Delete Selected Button**: Red destructive button, shows count of selected items

### Confirmation Modal
- **Title**: "Delete Selected Items"
- **Count Summary**: Total items to be deleted
- **Folder Section** (if applicable):
  - Red warning box with cascade deletion notice
  - List of folder names with folder icon (📁)
  - Warning text: "Deleting folders will permanently remove all contents..."
- **Content Section** (if applicable):
  - Orange warning box
  - List of content item names with appropriate icon
- **Error Display**: Red box showing which items failed (if any)
- **Actions**: Cancel (outline) and Delete (destructive red)

## State Management

### New State Variables
```typescript
// Multi-select delete state
const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(new Set());
const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
const [isBulkDeleting, setIsBulkDeleting] = useState(false);
```

### Computed Values
```typescript
const totalSelected = selectedFolderIds.size + selectedContentIds.size;
const allFoldersSelected = selectedFolderIds.size === folders.length && folders.length > 0;
const allContentSelected = selectedContentIds.size === content.length && content.length > 0;
```

## Handler Functions

### 1. Toggle Individual Selection
```typescript
const toggleFolderSelection = (folderId: string) => {
  setSelectedFolderIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(folderId)) {
      newSet.delete(folderId);
    } else {
      newSet.add(folderId);
    }
    return newSet;
  });
};

const toggleContentSelection = (contentId: string) => {
  setSelectedContentIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(contentId)) {
      newSet.delete(contentId);
    } else {
      newSet.add(contentId);
    }
    return newSet;
  });
};
```

### 2. Select All Toggle
```typescript
const toggleSelectAllFolders = () => {
  if (selectedFolderIds.size === folders.length && folders.length > 0) {
    setSelectedFolderIds(new Set());
  } else {
    setSelectedFolderIds(new Set(folders.map((f) => f._id)));
  }
};

const toggleSelectAllContent = () => {
  if (selectedContentIds.size === content.length && content.length > 0) {
    setSelectedContentIds(new Set());
  } else {
    setSelectedContentIds(new Set(content.map((c) => c._id)));
  }
};
```

### 3. Open Bulk Delete Modal
```typescript
const openBulkDelete = () => {
  if (selectedFolderIds.size === 0 && selectedContentIds.size === 0) {
    return;
  }
  setBulkDeleteOpen(true);
};
```

### 4. Bulk Delete Handler
```typescript
const handleBulkDelete = async () => {
  setIsBulkDeleting(true);
  setDeleteError(null);

  const errors: string[] = [];
  let successCount = 0;

  // Delete selected folders
  for (const folderId of Array.from(selectedFolderIds)) {
    try {
      await deleteFolderAPI(folderId); // Use appropriate API
      successCount++;
    } catch (error) {
      const folderName = folders.find((f) => f._id === folderId)?.name || folderId;
      errors.push(`Folder "${folderName}": ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Delete selected content
  for (const contentId of Array.from(selectedContentIds)) {
    try {
      await deleteContentAPI(contentId); // Use appropriate API
      successCount++;
    } catch (error) {
      const contentName = content.find((c) => c._id === contentId)?.title || contentId;
      errors.push(`Content "${contentName}": ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  setIsBulkDeleting(false);

  if (errors.length > 0) {
    setDeleteError(
      `Deleted ${successCount} item(s). Failed to delete ${errors.length} item(s):\n${errors.join("\n")}`
    );
  } else {
    toast.success(`Successfully deleted ${successCount} item(s)`);
    setBulkDeleteOpen(false);
    setSelectedFolderIds(new Set());
    setSelectedContentIds(new Set());

    // Refresh the list
    const data = await getHierarchyAPI(currentFolderId);
    setFolders(data.folders || []);
    setContent(data.content || []);
  }
};
```

### 5. Clear Selections on Navigation
```typescript
useEffect(() => {
  setParentId(currentFolderId);
  setLoading(true);
  // Clear selections when navigating to a different folder
  setSelectedFolderIds(new Set());
  setSelectedContentIds(new Set());
  
  getHierarchyAPI(currentFolderId)
    .then((data) => {
      setFolders(data.folders || []);
      setContent(data.content || []);
      setPath(data.path || []);
    })
    .finally(() => setLoading(false));
}, [currentFolderId]);
```

## JSX Structure Changes

### Header Section - Add Delete Button
```tsx
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Content Title</h1>
    <p className="text-gray-600">Description</p>
    {totalSelected > 0 && (
      <p className="text-sm text-blue-600 mt-1">
        {totalSelected} item(s) selected
      </p>
    )}
  </div>
  <div className="flex space-x-2">
    {totalSelected > 0 && (
      <Button
        onClick={openBulkDelete}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Selected ({totalSelected})
      </Button>
    )}
    {/* Other buttons (New Folder, Upload, etc.) */}
  </div>
</div>
```

### Folder Grid - Add Checkboxes and Select All
```tsx
{folders.length > 0 && (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-medium">Folders ({folders.length})</h3>
      <Button
        size="sm"
        variant="ghost"
        onClick={toggleSelectAllFolders}
        className="text-sm"
      >
        {selectedFolderIds.size === folders.length && folders.length > 0
          ? "Deselect All"
          : "Select All"}
      </Button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {folders.map((folder) => (
        <div key={folder._id} className="group relative">
          {/* Selection checkbox */}
          <div
            className="absolute top-2 left-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedFolderIds.has(folder._id)}
              onChange={() => toggleFolderSelection(folder._id)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          
          {/* Rest of folder card */}
        </div>
      ))}
    </div>
  </div>
)}
```

### Content Grid - Add Checkboxes and Select All
```tsx
{content.length > 0 && (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-medium">Content ({content.length})</h3>
      <Button
        size="sm"
        variant="ghost"
        onClick={toggleSelectAllContent}
        className="text-sm"
      >
        {selectedContentIds.size === content.length && content.length > 0
          ? "Deselect All"
          : "Select All"}
      </Button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {content.map((item) => (
        <div key={item._id} className="group relative">
          {/* Selection checkbox */}
          <div
            className="absolute top-2 left-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedContentIds.has(item._id)}
              onChange={() => toggleContentSelection(item._id)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          
          {/* Rest of content card */}
        </div>
      ))}
    </div>
  </div>
)}
```

### Bulk Delete Confirmation Modal
```tsx
<Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Delete Selected Items</DialogTitle>
      <DialogDescription>
        You are about to delete {totalSelected} item(s). This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {selectedFolderIds.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">
            ⚠️ Folders ({selectedFolderIds.size})
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Deleting folders will permanently remove all contents (subfolders and items) inside them.
          </p>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {Array.from(selectedFolderIds).map((id) => {
              const folder = folders.find((f) => f._id === id);
              return (
                <li key={id} className="text-sm text-red-800">
                  📁 {folder?.name || id}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedContentIds.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">
            Content ({selectedContentIds.size})
          </h4>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {Array.from(selectedContentIds).map((id) => {
              const item = content.find((c) => c._id === id);
              return (
                <li key={id} className="text-sm text-orange-800">
                  {getContentIcon()} {item?.title || id}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {deleteError && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-sm text-red-800 whitespace-pre-wrap">
            {deleteError}
          </p>
        </div>
      )}
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setBulkDeleteOpen(false);
          setDeleteError(null);
        }}
        disabled={isBulkDeleting}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        disabled={isBulkDeleting}
        className="bg-red-600 hover:bg-red-700"
      >
        {isBulkDeleting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {totalSelected} Item(s)
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Implementation Checklist

### For Each Content Manager Component:

- [ ] Add multi-select state variables
- [ ] Add totalSelected computed value
- [ ] Add toggle selection handlers
- [ ] Add select all handlers
- [ ] Add bulk delete handler
- [ ] Clear selections in useEffect on folder change
- [ ] Update header to show selected count
- [ ] Add "Delete Selected" button to header
- [ ] Add "Select All" button above folder grid
- [ ] Add checkboxes to each folder card
- [ ] Add "Select All" button above content grid
- [ ] Add checkboxes to each content card
- [ ] Add bulk delete confirmation modal
- [ ] Test folder cascade deletion
- [ ] Test content deletion
- [ ] Test mixed selection (folders + content)
- [ ] Test error handling
- [ ] Test navigation clears selection

## Content-Specific API Mappings

### Picture Templates
- Folder API: `deletePictureFolder(id)`
- Content API: `deletePictureContent(id)`
- Hierarchy API: `getPictureHierarchy(folderId)`
- Content variable: `templates`
- State: `selectedTemplateIds`

### Video Content
- Folder API: `deleteVideoFolder(id)`
- Content API: `deleteVideoContent(id)`
- Hierarchy API: `getVideoHierarchy(folderId)`
- Content variable: `videos`
- State: `selectedVideoIds`

### Audio Content
- Folder API: `deleteAudioFolder(id)`
- Content API: `deleteAudioContent(id)`
- Hierarchy API: `getAudioHierarchy(folderId)`
- Content variable: `audios`
- State: `selectedAudioIds`

### Video+QR Templates
- Folder API: `deleteFolder(id)` (templates)
- Content API: `deleteContent(id)` (templates)
- Hierarchy API: `getHierarchy(folderId)`
- Content variable: `templates`
- State: `selectedTemplateIds`

## Testing Scenarios

1. **Single Selection**
   - Select one folder, delete it
   - Select one content item, delete it

2. **Multiple Selection**
   - Select multiple folders, delete them
   - Select multiple content items, delete them
   - Select mixed (folders + content), delete them

3. **Select All**
   - Click "Select All" for folders
   - Click "Select All" for content
   - Select all, then deselect all

4. **Navigation**
   - Select items, navigate to different folder
   - Verify selections are cleared

5. **Error Handling**
   - Delete items where some fail
   - Verify error messages shown
   - Verify successful items are still deleted

6. **Cascade Deletion**
   - Select folder with subfolders and content
   - Verify warning in modal
   - Verify all nested items deleted

7. **Empty Selection**
   - Try to open bulk delete with nothing selected
   - Verify button is disabled or action prevented

## Notes

- Checkboxes use `stopPropagation()` to prevent card click events
- Selection uses `Set<string>` for O(1) lookup performance
- Errors are collected and displayed together after all deletions
- Toast notifications show success count
- Modal shows detailed error messages for failures
- Cascade deletion warnings are prominent in red boxes