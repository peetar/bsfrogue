import React, { useRef, useEffect } from 'react';

interface AutoGrowTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const AutoGrowTextarea: React.FC<AutoGrowTextareaProps> = ({
  value,
  onChange,
  placeholder = 'Type your answer here...',
  id,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(105, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      id={id}
      ref={textareaRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full p-4 rounded-xl border border-slate-300 dark:border-[#35486b] sepia:border-sepia-300 bg-slate-50 dark:bg-[#0c1322] sepia:bg-sepia-150 focus:bg-white dark:focus:bg-[#0f172a] sepia:focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:focus:ring-blue-400/30 sepia:focus:ring-sepia-700/30 focus:border-blue-600 dark:focus:border-blue-400 sepia:focus:border-sepia-700 text-slate-900 dark:text-slate-50 sepia:text-sepia-950 placeholder:text-slate-400 dark:placeholder:text-slate-500 sepia:placeholder:text-sepia-400/80 resize-none transition-all duration-150 leading-relaxed shadow-inner"
    />
  );
};
