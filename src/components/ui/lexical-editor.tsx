"use client";

import { RichTextEditor as TipTapEditor } from "./rich-text-editor";

/**
 * LexicalEditor component
 * 
 * This is a wrapper around the existing TipTap editor to maintain API compatibility
 * while we work on implementing a proper Lexical editor in the future.
 */

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LexicalEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
}: LexicalEditorProps) {
  // Simply pass through to the TipTap editor
  return (
    <TipTapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}