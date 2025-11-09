import { useState } from 'react';
import styles from './demo.module.css';
import Navbar from "@components/navbar/navbar";

const API_URL = 'https://telepod.up.railway.app';

interface MatchResult {
  name: string;
  location: string | null;
  coordinates: string | null;
  matchScore: number;
  relevantCapabilities: string[];
  response: string | null;
}

interface AIResponse {
  query: string;
  userName?: string;
  interpretation?: string;
  aiRecommendation?: string;
  matchCount: number;
  matches: MatchResult[];
  requestingUser?: any;
}

export default function DemoPage() {
  const [villageName, setVillageName] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: villageName,
          query,
          useAI: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.demoContainer}>
          <h1 className={styles.title}>AI-Powered Village Matching</h1>
          <p className={styles.subtitle}>
            Connect villages in need with communities that can help
          </p>

          <form onSubmit={handleMatch} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="villageName" className={styles.label}>
                Village Name
              </label>
              <input
                id="villageName"
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="e.g., Touba, Kaolack, Tambacounda"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="query" className={styles.label}>
                What do you need?
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Need medical supplies, Looking for teachers, Need farming equipment"
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Finding Matches...' : 'Find Matches'}
            </button>
          </form>

          {loading && (
            <div className={styles.loading}>
              <h3>AI is analyzing your request...</h3>
              <p>Finding the best village matches for your needs</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {results && !loading && (
            <div className={styles.results}>
              {results.interpretation && (
                <div className={styles.interpretation}>
                  <h2>AI Interpretation</h2>
                </div>
              )}

              <div className={styles.matches}>
                <h2>Top 5 Matching Villages</h2>
                {results.matches.length === 0 ? (
                  <p className={styles.noMatches}>
                    No matches found. Try a different query.
                  </p>
                ) : (
                  <div className={styles.matchList}>
                    {results.matches.slice(0, 5).map((match, index) => (
                      <div key={index} className={styles.matchCard}>
                        <div className={styles.matchHeader}>
                          <h3>{match.name}</h3>
                          {match.matchScore && (
                            <span className={styles.score}>
                              Score: {match.matchScore.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className={styles.location}>📍 {match.location || 'Unknown location'}</p>
                        {match.coordinates && (
                          <p className={styles.coordinates}>{match.coordinates}</p>
                        )}
                        {match.response && (
                          <div className={styles.response}>
                            <h4>Response:</h4>
                            <p>{match.response}</p>
                          </div>
                        )}
                        <div className={styles.facts}>
                          <h4>Relevant Capabilities:</h4>
                          <ul>
                            {match.relevantCapabilities.map((capability, i) => (
                              <li key={i}>{capability}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {results.aiRecommendation && (
                <div className={styles.recommendations}>
                  <h2>AI Recommendations</h2>
                  <p>{results.aiRecommendation}</p>
                </div>
              )}
            </div>
          )}

          <div className={styles.apiInfo}>
            <h3>System Status</h3>
            <p>
              <strong>API:</strong> {API_URL}
            </p>
            <p>
              <strong>MCP:</strong> https://telepod-mcp.up.railway.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
