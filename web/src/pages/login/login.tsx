import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import Navbar from "@components/navbar/navbar";

export default function LoginPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      // Store the village name in localStorage
      localStorage.setItem('villageName', name);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Village Portal</h1>
          <p className={styles.subtitle}>
            Enter your village name to access the dashboard
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Village Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Touba, Kaolack, Tambacounda"
                className={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Logging in...' : 'Access Dashboard'}
            </button>
          </form>

          <div className={styles.info}>
            <p>This is a demo portal. Any village name will be authenticated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
