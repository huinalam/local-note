import { NotesApp } from "~/features/notes/components/NotesApp";

type NotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  return <NotesApp activeNoteId={id} />;
}
