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
      case 'event': return <Activity className="h-5 w-5 text-indigo-400" />;
      case 'finding': return <Target className="h-5 w-5 text-amber-500" />;
      case 'ioc': return <Globe className="h-5 w-5 text-emerald-500" />;
      case 'user': return <User className="h-5 w-5 text-indigo-400" />;
      case 'response_action': return <Play className="h-5 w-5 text-emerald-400" />;
      default: return <Hash className="h-5 w-5 text-zinc-500" />;
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
      <div className="bg-panel border border-border rounded-md overflow-hidden mb-6">
        <div className="px-6 py-3 border-b border-border bg-zinc-950/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">{title}</h3>
          <Badge variant="default">{items.length}</Badge>
        </div>
        <div className="divide-y divide-border/50">
          {items.map((item, idx) => (
            <Link 
              key={`${type}-${item.id}-${idx}`} 
              to={getResultLink(item)}
              className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center">
                <div className="bg-zinc-950 border border-border p-2 rounded mr-4">
                  {getResultIcon(type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    ID: {item.id}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <h1 className="text-3xl font-bold text-zinc-100 tracking-wide mb-2">Global Search</h1>
        <p className="text-zinc-400">Query across all system entities and threat intelligence</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto w-full mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search for incidents, IP addresses, hashes, users..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-panel border-2 border-border rounded-md pl-14 pr-4 py-4 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-lg text-zinc-100"
          autoFocus
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-indigo-400-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">
          <div className="animate-pulse flex flex-col items-center">
            <SearchIcon className="h-8 w-8 mb-4 opacity-50" />
            Searching CYRENIX data lake...
          </div>
        </div>
      ) : results ? (
        <div className="flex-1 pb-12">
          <div className="text-sm text-zinc-400 mb-6 flex justify-between items-center">
            <span>Found {totalResults} results for "<strong className="text-zinc-100">{queryParam}</strong>"</span>
          </div>
          
          {totalResults === 0 ? (
            <div className="bg-panel border border-border rounded-md p-12 text-center text-zinc-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">No results found</h3>
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
