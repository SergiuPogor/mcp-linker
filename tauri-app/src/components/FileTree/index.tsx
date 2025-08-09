import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useFolderStore } from "@/hooks/useFolderStore";
import { useContextFilesStore } from "@/hooks/useContextFilesStore";
import { useFileTokens } from "@/hooks/useFileTokens";
import { useFileViewerStore } from "@/hooks/useFileViewerStore";
import { FileTreeHeader } from "./FileTreeHeader";
import { FileTreeItem } from "./FileTreeItem";

interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size?: number;
  extension?: string;
}

interface FileTreeProps {
  currentFolder?: string;
  onAddToChat?: (path: string) => void;
  onFileClick?: (path: string) => void;
}

export function FileTree({
  currentFolder,
  onAddToChat,
  onFileClick,
}: FileTreeProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  
  // Mock exclude folders for now - in a real app this would come from settings
  const excludeFolders = ["node_modules", ".git", "dist", "build"];
  
  const { currentFolder: storeCurrentFolder, setCurrentFolder } = useFolderStore();
  const { addFile, clearFiles } = useContextFilesStore();
  const { calculateTokens } = useFileTokens();
  const { setSelectedFile } = useFileViewerStore();

  const loadDirectory = async (path?: string) => {
    setLoading(true);
    setError(null);

    try {
      let targetPath = path || storeCurrentFolder || currentFolder;
      if (!targetPath) {
        const defaultDirs = await invoke<string[]>("get_default_directories");
        targetPath = defaultDirs[0];
        setCurrentFolder(targetPath);
      }

      const result = await invoke<FileEntry[]>("read_directory", {
        path: targetPath,
      });
      setEntries(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddToChat = (path: string) => {
    addFile(path);
    if (onAddToChat) {
      onAddToChat(path);
    }
  };

  const handleFileClick = (path: string, isDirectory: boolean) => {
    if (!isDirectory) {
      // Set the file for viewing
      setSelectedFile(path);
      
      // Also add to context
      clearFiles();
      addFile(path);
      
      if (onFileClick) {
        onFileClick(path);
      }
    }
  };

  const handleSetWorkingFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
    setFilterText("");
    loadDirectory(folderPath);
  };

  const isFiltered = (entry: FileEntry): boolean => {
    if (
      filterText &&
      !entry.name.toLowerCase().includes(filterText.toLowerCase())
    ) {
      return true;
    }

    if (entry.is_directory && excludeFolders.includes(entry.name)) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    loadDirectory();
  }, [storeCurrentFolder, currentFolder]);

  if (loading && entries.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">Loading files...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <FileTreeHeader
        currentFolder={storeCurrentFolder || currentFolder}
        filterText={filterText}
        onFilterTextChange={setFilterText}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        onRefresh={() => loadDirectory()}
        excludeFolders={excludeFolders}
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        {entries.map((entry) => (
          <FileTreeItem
            key={entry.path}
            entry={entry}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onAddToChat={handleAddToChat}
            onFileClick={handleFileClick}
            onSetWorkingFolder={handleSetWorkingFolder}
            onCalculateTokens={calculateTokens}
            isFiltered={isFiltered}
          />
        ))}
      </div>
    </div>
  );
}