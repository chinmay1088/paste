import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown, { Components } from 'react-markdown';

// Unified markdown components for consistent styling across the app
export const markdownComponents: Components = {
  // Headings
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold text-white mb-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-bold text-white mb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-bold text-white mb-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-bold text-white mb-2" {...props}>{children}</h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-sm font-bold text-white mb-2" {...props}>{children}</h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-xs font-bold text-white mb-2" {...props}>{children}</h6>
  ),
  
  // Text elements
  p: ({ children, ...props }) => (
    <p className="text-white/90 mb-2 leading-relaxed" {...props}>{children}</p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-white" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-white/90" {...props}>{children}</em>
  ),
  
  // Lists
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside text-white/90 mb-2 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside text-white/90 mb-2 space-y-1" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>{children}</li>
  ),
  
  // Blockquote
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/80 mb-2 bg-white/5 py-2 rounded-r" {...props}>
      {children}
    </blockquote>
  ),
  
  // Code elements
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    // If it's a code block (has language), render with syntax highlighter
    if (language) {
      return (
        <SyntaxHighlighter
          language={language === 'typescript' ? 'tsx' : language}
          style={oneDark}
          customStyle={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            margin: '8px 0',
            fontSize: '14px',
          }}
          wrapLongLines={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
    
    // Inline code
    return (
      <code
        className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-white border border-white/10"
        {...props}
      >
        {children}
      </code>
    );
  },
  
  pre: ({ children, ...props }) => (
    <pre className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto mb-2 text-sm" {...props}>
      {children}
    </pre>
  ),
  
  // Tables
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="border-collapse border border-white/20 w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-white/10" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-white/10" {...props}>{children}</tr>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-white/20 px-3 py-2 bg-white/10 font-bold text-white text-left" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-white/20 px-3 py-2 text-white/90" {...props}>
      {children}
    </td>
  ),
  
  // Links
  a: ({ children, href, ...props }: any) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  
  // Horizontal rule
  hr: () => (
    <hr className="border-white/20 my-4" />
  ),
  
  // Images
  img: ({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg border border-white/10 my-2"
      {...props}
    />
  ),
};

// Unified content renderer that handles all formats consistently
export function renderContent(content: string, format: string): React.ReactNode {
  if (!content) return null;

  switch (format) {
    case 'markdown':
      return (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      );

    case 'javascript':
    case 'typescript':
    case 'python':
    case 'json':
      return (
        <SyntaxHighlighter
          language={format === 'typescript' ? 'tsx' : format}
          style={oneDark}
          customStyle={{
            background: 'transparent',
            padding: '0',
            margin: '0',
            fontSize: '14px',
          }}
          wrapLongLines={true}
          showLineNumbers={true}
          lineNumberStyle={{
            color: 'rgba(255, 255, 255, 0.3)',
            paddingRight: '1em',
            minWidth: '2em',
          }}
        >
          {content}
        </SyntaxHighlighter>
      );

    case 'text':
    default:
      return (
        <pre className="text-sm text-white/90 font-mono whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </pre>
      );
  }
}

// Export individual components for flexibility
export { ReactMarkdown, SyntaxHighlighter, oneDark };
