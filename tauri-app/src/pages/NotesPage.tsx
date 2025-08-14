import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteList } from "@/components/notes/NoteList";

export default function NotesPage() {
  return (
    <div className="h-full flex">
      <div className="w-80 border-r">
        <NoteList />
      </div>
      <div className="flex-1">
        <NoteEditor />
      </div>
    </div>
  );
}