import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import searchApi from '../../api/searchApi';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar = ({ className = '', placeholder = 'Tìm kiếm sản phẩm...', initialValue = '' }: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng suggestion
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions khi người dùng gõ
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const results = await searchApi.getSuggestions(searchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError('Không thể tải gợi ý tìm kiếm. Vui lòng thử lại sau.');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      loadSuggestions();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setError(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div className={`relative ${className}`} ref={suggestionRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="absolute z-10 w-full mt-1 bg-red-50 text-red-600 border border-red-200 rounded-md p-2 text-sm">
          {error}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (searchQuery.length >= 2) && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Đang tìm kiếm...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">Không có gợi ý</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 