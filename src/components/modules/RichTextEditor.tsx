"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

// FontSize extension
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace("px", "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}px` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
    } as never;
  },
});

export interface RichTextEditorRef {
  insertText: (text: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36"];
const FONT_FAMILIES = [
  { label: "Padrão", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
          : "text-gray-600 hover:bg-gray-100 border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor(
  { value, onChange, placeholder },
  ref
) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] p-4 focus:outline-none text-sm text-gray-800 leading-relaxed",
      },
    },
  });

  // Sync external value changes (e.g., when editing an existing template)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    const isEmpty = !value || value === "<p></p>";
    if (isEmpty && editor.isEmpty) return;
    if (value === current) return;
    editor.commands.setContent(value || "", false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (!editor || editor.isDestroyed) return;
      editor.chain().focus().insertContent(text).run();
    },
  }));

  if (!editor) return null;

  function toggleHtmlMode() {
    if (!editor) return;
    if (!htmlMode) {
      setHtmlSource(editor.getHTML());
      setHtmlMode(true);
    } else {
      editor.commands.setContent(htmlSource, false);
      onChange(htmlSource);
      setHtmlMode(false);
    }
  }

  return (
    <div className="border border-emerald-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-emerald-100 bg-gray-50">
        {/* Font Family */}
        <select
          className="text-xs border border-gray-200 rounded px-1 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
          title="Fonte"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Font Size */}
        <select
          className="text-xs border border-gray-200 rounded px-1 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 w-16"
          onChange={(e) => {
            if (e.target.value) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor.chain().focus() as any).setFontSize(e.target.value).run();
            }
          }}
          title="Tamanho da fonte"
        >
          <option value="">Tam.</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrito (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Itálico (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Sublinhado (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        {/* Strike */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Tachado"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Align Left */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Alinhar à esquerda"
        >
          ≡
        </ToolbarButton>

        {/* Align Center */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centralizar"
        >
          ≡
        </ToolbarButton>

        {/* Align Right */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Alinhar à direita"
        >
          ≡
        </ToolbarButton>

        {/* Justify */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justificar"
        >
          ≡
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Bullet list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista"
        >
          •≡
        </ToolbarButton>

        {/* Ordered list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          1≡
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Text Color */}
        <label className="flex items-center gap-1 cursor-pointer" title="Cor do texto">
          <span className="text-xs text-gray-600">A</span>
          <input
            type="color"
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            onInput={(e) =>
              editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
            }
            title="Cor do texto"
          />
        </label>

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Limpar formatação"
        >
          ✕
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* HTML mode toggle */}
        <ToolbarButton
          onClick={toggleHtmlMode}
          active={htmlMode}
          title={htmlMode ? "Voltar ao editor visual" : "Editar HTML"}
        >
          &lt;/&gt;
        </ToolbarButton>
      </div>

      {/* Editor area */}
      {htmlMode ? (
        <textarea
          className="w-full min-h-[320px] p-4 font-mono text-xs text-gray-800 focus:outline-none resize-y bg-gray-50"
          value={htmlSource}
          onChange={(e) => {
            setHtmlSource(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
        />
      ) : (
        <div className="relative">
          {editor.isEmpty && placeholder && (
            <p className="absolute top-4 left-4 text-gray-400 text-sm pointer-events-none select-none whitespace-pre-wrap">
              {placeholder}
            </p>
          )}
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
});

export default RichTextEditor;
