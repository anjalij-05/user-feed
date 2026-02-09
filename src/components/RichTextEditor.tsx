import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  className = '',
  minHeight = '200px',
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Check if Quill is already initialized
    if (quillRef.current) {
      console.log('Quill already initialized, skipping...');
      return;
    }

    console.log('Initializing new Quill instance...');

    // Create a container for Quill
    const container = editorRef.current;

    // Initialize Quill
    const quill = new Quill(container, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link'],
          ['clean'],
        ],
      },
    });

    quillRef.current = quill;

    // Set initial value
    if (value) {
      isUpdatingRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(value);
      isUpdatingRef.current = false;
    }

    // Handle text changes
    const handleChange = () => {
      if (isUpdatingRef.current) return;

      const html = quill.root.innerHTML;
      console.log('Text changed, new content:', html);
      onChange(html);
    };

    quill.on('text-change', handleChange);

    // Cleanup
    return () => {
      console.log('Cleaning up Quill instance...');
      quill.off('text-change', handleChange);
      quillRef.current = null;
    };
  }, [placeholder]); // Re-initialize if placeholder changes

  // Update content when value changes externally
  useEffect(() => {
    if (!quillRef.current) return;

    const currentContent = quillRef.current.root.innerHTML;
    if (value !== currentContent) {
      console.log('Updating content from external value change');
      isUpdatingRef.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
      if (selection) {
        quillRef.current.setSelection(selection);
      }
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <div
        ref={editorRef}
        className="bg-background border border-input rounded-md"
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;

