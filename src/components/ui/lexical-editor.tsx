"use client";

import { useEffect, useState } from "react";
import { $getRoot, $createParagraphNode, EditorState, LexicalEditor as LexicalEditorType, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode } from "@lexical/rich-text";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// Toolbar is implemented manually with custom components
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Link as LinkIcon, Code } from "lucide-react";

/**
 * LexicalEditor component
 * 
 * A rich text editor built with Lexical framework
 */

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Define theme for the editor
const editorTheme = {
  root: "p-4 border border-input rounded-md min-h-[150px] focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
  link: "cursor-pointer text-primary underline underline-offset-4",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
  paragraph: "my-2",
  heading: {
    h1: "text-3xl font-bold my-4",
    h2: "text-2xl font-bold my-3",
    h3: "text-xl font-bold my-2",
    h4: "text-lg font-bold my-2",
    h5: "text-base font-bold my-1",
    h6: "text-sm font-bold my-1",
  },
  list: {
    ul: "list-disc ml-6 my-2",
    ol: "list-decimal ml-6 my-2",
    listitem: "my-1",
  },
  quote: "border-l-4 border-gray-300 pl-4 italic my-4",
  code: "bg-muted p-1 rounded text-sm font-mono",
  codeHighlight: {
    atrule: "text-blue-500",
    attr: "text-yellow-500",
    boolean: "text-purple-500",
    builtin: "text-green-500",
    cdata: "text-gray-500",
    char: "text-green-500",
    class: "text-blue-500",
    "class-name": "text-blue-500",
    comment: "text-gray-500 italic",
    constant: "text-purple-500",
    deleted: "text-red-500",
    doctype: "text-gray-500",
    entity: "text-yellow-500",
    function: "text-green-500",
    important: "text-red-500",
    inserted: "text-green-500",
    keyword: "text-purple-500",
    namespace: "text-yellow-500",
    number: "text-purple-500",
    operator: "text-yellow-500",
    prolog: "text-gray-500",
    property: "text-blue-500",
    punctuation: "text-gray-500",
    regex: "text-red-500",
    selector: "text-blue-500",
    string: "text-green-500",
    symbol: "text-purple-500",
    tag: "text-blue-500",
    url: "text-green-500",
    variable: "text-yellow-500",
  },
};

// Plugin to handle HTML conversion
function HtmlConversionPlugin({ value }: { value: string; onChange?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  // Initialize editor with HTML content
  useEffect(() => {
    if (!value) return;
    
    editor.update(() => {
      // Clear editor content
      const root = $getRoot();
      root.clear();
      
      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');
      
      // Convert DOM to Lexical nodes
      const nodes = $generateNodesFromDOM(editor, dom);
      
      // If no nodes were generated, create a default paragraph
      if (nodes.length === 0) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      } else {
        // Otherwise, append the generated nodes
        root.append(...nodes);
      }
    });
  }, [editor, value]);
  
  return null;
}

// Placeholder plugin
function PlaceholderPlugin({ placeholder }: { placeholder: string }) {
  return (
    <div className="absolute top-[1.125rem] left-[1.125rem] pointer-events-none inline-block select-none overflow-hidden text-muted-foreground">
      {placeholder}
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={title}
    >
      {icon}
    </Button>
  );
}

// Link Button Component with Popover
function LinkButton({ editor }: { editor: LexicalEditorType | null }) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  // Function to insert link when button is clicked
  const insertLink = () => {
    if (!url || !editor) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    setUrl("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Insert Link</p>
          <div className="flex gap-2">
            <Input 
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={insertLink} disabled={!url}>Insert</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Create quote node function
function $createQuoteNode() {
  return new QuoteNode();
}

export function LexicalEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
}: LexicalEditorProps) {
  // No theme handling needed for now
  const [isMounted, setIsMounted] = useState(false);
  const [editor, setEditor] = useState<LexicalEditorType | null>(null);
  
  // Handle SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Skip rendering during SSR to avoid hydration issues
  if (!isMounted) {
    return <div className={cn("border border-input rounded-md min-h-[150px]", className)} />;
  }
  
  // Define editor config
  const initialConfig = {
    namespace: "blog-editor",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode
    ],
  };
  
  // Handle editor changes
  const handleEditorChange = (editorState: EditorState, editor: LexicalEditorType) => {
    // Set editor reference for toolbar access
    setEditor(editor);
    
    editorState.read(() => {
      // Convert editor content to HTML
      const htmlString = $generateHtmlFromNodes(editor);
      // Call onChange with the HTML string
      if (onChange) {
        onChange(htmlString);
      }
    });
  };

  return (
    <div className={cn("relative border border-input rounded-md", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="border-b border-input p-2 flex flex-wrap gap-1 items-center">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            title="Bold"
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            title="Italic"
          />
          <ToolbarButton
            icon={<Underline className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            title="Underline"
          />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <ToolbarButton
            icon={<Heading1 className="h-4 w-4" />}
            onClick={() => {
              editor?.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode("h1"));
                }
              });
            }}
            title="Heading 1"
          />
          <ToolbarButton
            icon={<Heading2 className="h-4 w-4" />}
            onClick={() => {
              editor?.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode("h2"));
                }
              });
            }}
            title="Heading 2"
          />
          <ToolbarButton
            icon={<Heading3 className="h-4 w-4" />}
            onClick={() => {
              editor?.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode("h3"));
                }
              });
            }}
            title="Heading 3"
          />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }}
            title="Numbered List"
          />
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }}
            title="Bullet List"
          />
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            onClick={() => {
              editor?.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createQuoteNode());
                }
              });
            }}
            title="Quote"
          />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <LinkButton editor={editor} />
          <ToolbarButton
            icon={<Code className="h-4 w-4" />}
            onClick={() => {
              editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            title="Code"
          />
        </div>
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none min-h-[150px] p-4" />}
          placeholder={<PlaceholderPlugin placeholder={placeholder} />}
          ErrorBoundary={() => <div>Something went wrong</div>}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <LinkPlugin />
        <ListPlugin />
        <HtmlConversionPlugin value={value} onChange={onChange} />
        <OnChangePlugin onChange={handleEditorChange} />
      </LexicalComposer>
    </div>
  );
}