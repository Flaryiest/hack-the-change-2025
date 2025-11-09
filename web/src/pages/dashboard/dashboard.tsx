import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import Navbar from "@components/navbar/navbar";

const API_URL = 'https://telepod.up.railway.app';

interface Village {
  id: string;
  name: string;
  location: string;
  coordinates?: string;
  facts: string[];
}

export default function DashboardPage() {
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    location: '',
    coordinates: '',
    facts: [] as string[],
  });
  const [newFact, setNewFact] = useState('');
  const navigate = useNavigate();

  const villageName = localStorage.getItem('villageName');
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  useEffect(() => {
    if (!isAuthenticated || !villageName) {
      navigate('/login');
      return;
    }
    fetchVillageData();
  }, []);

  const fetchVillageData = async () => {
    try {
      setLoading(true);
      // Get all Senegalese villages and search for the specific one
      const response = await fetch(`${API_URL}/api/search/location/Senegal`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch village data');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      console.log('Looking for village:', villageName); // Debug log
      
      // Search for exact match first, then partial match
      let foundVillage = data.users?.find((u: Village) => 
        u.name.toLowerCase() === villageName?.toLowerCase()
      );
      
      if (!foundVillage) {
        foundVillage = data.users?.find((u: Village) => 
          u.name.toLowerCase().includes(villageName?.toLowerCase() || '')
        );
      }
      
      console.log('Found village:', foundVillage); // Debug log
      
      if (foundVillage) {
        setVillage(foundVillage);
        setEditData({
          location: foundVillage.location || '',
          coordinates: foundVillage.coordinates || '',
          facts: [...foundVillage.facts],
        });
        setError(null); // Clear any previous errors
      } else {
        setError(`Village "${villageName}" not found in the database. Available villages can be viewed on the Villages page.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load village data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('villageName');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (village) {
      setEditData({
        location: village.location || '',
        coordinates: village.coordinates || '',
        facts: [...village.facts],
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    if (!village) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${village.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update village');
      }

      const updatedVillage = await response.json();
      setVillage(updatedVillage);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleAddFact = () => {
    if (newFact.trim()) {
      setEditData({
        ...editData,
        facts: [...editData.facts, newFact.trim()],
      });
      setNewFact('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setEditData({
      ...editData,
      facts: editData.facts.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.loading}>
            <p>Loading village data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !village) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={handleLogout} className={styles.button}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.dashboardContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>{village?.name} Dashboard</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>

          <div className={styles.content}>
            {error && (
              <div className={styles.errorBanner}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Village Information</h2>
              
              <div className={styles.field}>
                <label className={styles.label}>Location</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{village?.location || 'Not set'}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Coordinates</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.coordinates}
                    onChange={(e) => setEditData({ ...editData, coordinates: e.target.value })}
                    className={styles.input}
                    placeholder="e.g., 14.6928° N, 17.4467° W"
                  />
                ) : (
                  <p className={styles.value}>{village?.coordinates || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Needs & Resources</h2>
              
              {editing ? (
                <div className={styles.factsEdit}>
                  <div className={styles.factsList}>
                    {editData.facts.map((fact, index) => (
                      <div key={index} className={styles.factItem}>
                        <span>{fact}</span>
                        <button
                          onClick={() => handleRemoveFact(index)}
                          className={styles.removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.addFact}>
                    <input
                      type="text"
                      value={newFact}
                      onChange={(e) => setNewFact(e.target.value)}
                      placeholder="Add a new need or resource"
                      className={styles.input}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFact())}
                    />
                    <button onClick={handleAddFact} className={styles.addButton}>
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <ul className={styles.factsList}>
                  {village?.facts.map((fact, index) => (
                    <li key={index} className={styles.factItem}>{fact}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.actions}>
              {editing ? (
                <>
                  <button onClick={handleSave} className={styles.saveButton}>
                    Save Changes
                  </button>
                  <button onClick={handleCancelEdit} className={styles.cancelButton}>
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleEdit} className={styles.editButton}>
                  Edit Village Data
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
