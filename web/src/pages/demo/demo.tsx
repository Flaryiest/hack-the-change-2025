import { useState } from 'react';
import styles from './demo.module.css';
import Navbar from "@components/navbar/navbar";

const API_URL = 'https://telepod.up.railway.app';

interface MatchResult {
  name: string;
  location: string;
  facts: string[];
  score?: number;
  reason?: string;
}

interface AIResponse {
  query: string;
  interpretation: string;
  matches: MatchResult[];
  recommendations: string;
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
          villageName,
          query,
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

          {error && (
            <div className={styles.error}>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div className={styles.results}>
              <div className={styles.interpretation}>
                <h2>AI Interpretation</h2>
                <p>{results.interpretation}</p>
              </div>

              <div className={styles.matches}>
                <h2>Matching Villages ({results.matches.length})</h2>
                {results.matches.length === 0 ? (
                  <p className={styles.noMatches}>
                    No matches found. Try a different query.
                  </p>
                ) : (
                  <div className={styles.matchList}>
                    {results.matches.map((match, index) => (
                      <div key={index} className={styles.matchCard}>
                        <div className={styles.matchHeader}>
                          <h3>{match.name}</h3>
                          {match.score && (
                            <span className={styles.score}>
                              Score: {match.score.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className={styles.location}>📍 {match.location}</p>
                        {match.reason && (
                          <p className={styles.reason}>{match.reason}</p>
                        )}
                        <div className={styles.facts}>
                          <h4>Resources & Facts:</h4>
                          <ul>
                            {match.facts.map((fact, i) => (
                              <li key={i}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {results.recommendations && (
                <div className={styles.recommendations}>
                  <h2>AI Recommendations</h2>
                  <p>{results.recommendations}</p>
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
