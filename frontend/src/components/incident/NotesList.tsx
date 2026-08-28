import React, { useEffect, useState } from 'react';
import { notesApi, AnalystNote } from '../../api/notes';
import { User, Clock, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NotesListProps {
  incidentId: number;
}

export const NotesList: React.FC<NotesListProps> = ({ incidentId }) => {
  const [notes, setNotes] = useState<AnalystNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchNotes = async () => {
    try {
      const data = await notesApi.getByIncident(incidentId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [incidentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      await notesApi.create(incidentId, newNote.trim());
      setNewNote('');
      fetchNotes();
    } catch (error) {
      console.error('Failed to submit note', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading notes...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center text-gray-500 py-12 italic">
            No analyst notes for this incident yet.
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-panel border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-sm font-medium text-white">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  User #{note.author_id}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap ml-8">
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-panel border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note, finding, or hypothesis..."
            className="flex-1 bg-background border border-border rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none h-14"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!newNote.trim() || isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isSubmitting ? (
              'Posting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" /> Post
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
