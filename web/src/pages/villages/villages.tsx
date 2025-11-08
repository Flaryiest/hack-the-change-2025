import { useState, useEffect } from 'react';
import styles from './villages.module.css';
import Navbar from "@components/navbar/navbar";

const API_URL = 'https://telepod.up.railway.app';

interface Village {
  id: string;
  name: string;
  location: string;
  coordinates?: string;
  facts: string[];
}

export default function VillagesPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      // Since the API doesn't have a GET all users endpoint, we'll use the MCP endpoint
      // Or we can search by location to get villages
      const response = await fetch(`${API_URL}/api/search/location/Senegal`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setVillages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const filteredVillages = villages.filter((village) =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.facts.some((fact) =>
      fact.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.villagesContainer}>
          <h1 className={styles.title}>Senegalese Villages</h1>
          <p className={styles.subtitle}>
            Browse {villages.length} villages connected through TelePod
          </p>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search villages by name, location, or needs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {loading && (
            <div className={styles.loading}>
              <p>Loading villages...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={fetchVillages} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className={styles.villageGrid}>
              {filteredVillages.length === 0 ? (
                <p className={styles.noResults}>
                  No villages found matching "{searchTerm}"
                </p>
              ) : (
                filteredVillages.map((village) => (
                  <div key={village.id} className={styles.villageCard}>
                    <h2 className={styles.villageName}>{village.name}</h2>
                    <p className={styles.villageLocation}>📍 {village.location}</p>
                    {village.coordinates && (
                      <p className={styles.coordinates}>{village.coordinates}</p>
                    )}
                    <div className={styles.factsSection}>
                      <h3>Needs & Resources:</h3>
                      <ul className={styles.factsList}>
                        {village.facts.map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{villages.length}</span>
              <span className={styles.statLabel}>Total Villages</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{filteredVillages.length}</span>
              <span className={styles.statLabel}>Showing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
