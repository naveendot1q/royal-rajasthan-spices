"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { debounce } from "@rrs/shared";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  primary_image: string | null;
  category_name: string;
  _formatted?: { name: string };
}

interface SearchBarProps {
  autoFocus?: boolean;
  onClose?: () => void;
}

export function SearchBar({ autoFocus, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setResults([]); setLoading(false); return; }
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.hits || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250),
    []
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) { setLoading(true); setShowDropdown(true); }
    else { setShowDropdown(false); }
    fetchSuggestions(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
    setShowDropdown(false);
  };

  const handleSelect = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose?.();
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search spices, masalas, blends…"
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-royal-gold-200 focus:border-royal-gold-500 rounded-xl outline-none text-sm text-gray-800 placeholder-gray-400 transition-colors"
            autoComplete="off"
          />
          {loading && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-royal-gold-500 animate-spin" />
          )}
        </div>
        <button type="submit" className="px-5 py-3 bg-maroon-500 hover:bg-maroon-600 text-white rounded-xl font-medium text-sm transition-colors whitespace-nowrap">
          Search
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-royal-gold-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onMouseDown={() => handleSelect(result.slug)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-royal-gold-50 transition-colors text-left"
            >
              {result.primary_image ? (
                <img src={result.primary_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-desert-sand flex items-center justify-center flex-shrink-0 text-lg">🌶</div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium text-gray-800 truncate"
                  dangerouslySetInnerHTML={{ __html: result._formatted?.name || result.name }}
                />
                <div className="text-xs text-gray-500">{result.category_name} · ₹{result.base_price}</div>
              </div>
              <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          ))}
          {query.length >= 2 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-3 bg-royal-gold-50 hover:bg-royal-gold-100 text-royal-gold-700 text-sm font-medium border-t border-royal-gold-100 transition-colors"
            >
              <Search size={14} />
              See all results for "{query}"
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
