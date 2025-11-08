import styles from './index.module.css'

import { Link } from 'react-router-dom';
import Navbar from "@components/navbar/navbar"


export default function IndexPage() {
  return (
    <div className={styles.pageContainer}>  
      <Navbar />
      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Connecting Villages Through AI</h1>
          <p className={styles.subtitle}>TelePod connects remote Senegalese villages via LoRa radio, matching communities with resources they need.</p>
          <Link className={styles.ctaButton} to="/demo">Find Matches</Link>
          <img src="/landing/maps.jpg" className={styles.heroImage} />
        </div>

      </div>
    </div>
  );
}