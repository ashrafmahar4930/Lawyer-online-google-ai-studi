import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isDark?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  isDark = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  const baseButtonClasses = isDark 
    ? "bg-slate-800/80 border-slate-700 text-slate-200" 
    : "bg-white border-slate-200 text-slate-800";
    
  const dropdownClasses = isDark 
    ? "bg-slate-800 border-slate-700" 
    : "bg-white border-slate-200 shadow-xl";

  const optionHoverClasses = isDark 
    ? "hover:bg-slate-700 text-slate-200" 
    : "hover:bg-slate-100 text-slate-800";

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 ${baseButtonClasses} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-500"}`}
      >
        <span className={`block truncate ${!selectedOption && isDark ? "text-slate-400" : !selectedOption ? "text-slate-400" : "font-bold"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-2xl border overflow-hidden ${dropdownClasses} animate-in fade-in zoom-in-95 duration-200`}>
          {/* Search Input */}
          <div className={`flex items-center px-3 py-2 border-b ${isDark ? "border-slate-700" : "border-slate-100"}`}>
            <Search className={`w-4 h-4 mr-2 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className={`w-full bg-transparent border-none outline-none text-sm ${isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent closing when typing
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {/* Show an "All / Clear" option conditionally if needed, but here we can just map */}
            <div 
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${optionHoverClasses}`}
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              {placeholder}
            </div>
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${optionHoverClasses} ${value === opt.value ? (isDark ? "bg-slate-700" : "bg-blue-50 text-blue-700") : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className={`px-4 py-4 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
