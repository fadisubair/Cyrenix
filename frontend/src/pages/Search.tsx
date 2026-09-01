import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchApi } from '../api';
import { Search as SearchIcon, ShieldAlert, Activity, Target, Globe, User, Play, ChevronRight, Hash } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [queryParam]);

  const performSearch = async (searchStr: string) => {
    if (!searchStr || searchStr.length < 2) return;
    setIsLoading(true);
    try {
      const data = await searchApi.globalSearch(searchStr);
      setResults(data);
    } catch (error) {
      console.error('Failed to perform search', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setSearchParams({ q: query.trim() });
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'incident': return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      case 'event': return <Activity className="h-5 w-5 text-blue-500" />;
      case 'finding': return <Target className="h-5 w-5 text-amber-500" />;
      case 'ioc': return <Globe className="h-5 w-5 text-emerald-500" />;
      case 'user': return <User className="h-5 w-5 text-purple-500" />;
      case 'response_action': return <Play className="h-5 w-5 text-cyan-500" />;
      default: return <Hash className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultLink = (item: any) => {
    switch (item.type) {
      case 'incident': return `/incidents/${item.id}`;
      case 'finding': return `/incidents`; // We don't have a direct finding route yet, would route to incident
      case 'event': return `/events?search=${item.id}`;
      case 'ioc': return `/intel?search=${item.title}`;
      case 'response_action': return `/responses`;
      default: return '#';
    }
  };

  const ResultSection = ({ title, items, type }: { title: string, items: any[], type: string }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="bg-panel border border-border rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-3 border-b border-border bg-background/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <Badge variant="default">{items.length}</Badge>
        </div>
        <div className="divide-y divide-border/50">
          {items.map((item, idx) => (
            <Link 
              key={`${type}-${item.id}-${idx}`} 
              to={getResultLink(item)}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
              <div className="flex items-center">
                <div className="bg-background border border-border p-2 rounded mr-4">
                  {getResultIcon(type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {item.id}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const totalResults = results ? 
    (results.incidents?.length || 0) + 
    (results.events?.length || 0) + 
    (results.findings?.length || 0) + 
    (results.iocs?.length || 0) + 
    (results.users?.length || 0) + 
    (results.response_actions?.length || 0) 
    : 0;

  return (
    <div className="space-y-6 flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white tracking-wide mb-2">Global Search</h1>
        <p className="text-gray-400">Query across all system entities and threat intelligence</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto w-full mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search for incidents, IP addresses, hashes, users..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-panel border-2 border-border rounded-xl pl-14 pr-4 py-4 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-lg text-white"
          autoFocus
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-pulse flex flex-col items-center">
            <SearchIcon className="h-8 w-8 mb-4 opacity-50" />
            Searching CYRENIX data lake...
          </div>
        </div>
      ) : results ? (
        <div className="flex-1 pb-12">
          <div className="text-sm text-gray-400 mb-6 flex justify-between items-center">
            <span>Found {totalResults} results for "<strong className="text-white">{queryParam}</strong>"</span>
          </div>
          
          {totalResults === 0 ? (
            <div className="bg-panel border border-border rounded-lg p-12 text-center text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p>Try adjusting your search terms or using different keywords.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ResultSection title="Incidents" items={results.incidents} type="incident" />
              <ResultSection title="Findings" items={results.findings} type="finding" />
              <ResultSection title="Events" items={results.events} type="event" />
              <ResultSection title="Threat Intelligence" items={results.iocs} type="ioc" />
              <ResultSection title="Response Actions" items={results.response_actions} type="response_action" />
              <ResultSection title="Identities" items={results.users} type="user" />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
