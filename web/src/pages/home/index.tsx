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
              <div className={styles.featureSection}>
        <h2 className={styles.featureTitle}>AI-Powered Village Matching</h2>
        <h3 className={styles.featureSubtitle}>How TelePod Works</h3>
        <div className={styles.featureCardContainer}>
          
            <div className={styles.featureColumnOne}>
              <div className={styles.featureOne}>
                <img src="/landing/journey.png" className={styles.featureImage}/>
              <div className={styles.featureOneText}>
                <h4 className={styles.featureOneTitle}>Villages Share Needs & Resources</h4>
                <p className={styles.featureOneDescription}>Remote villages broadcast their needs (medical supplies, food, education) or available resources via low-cost LoRa radio.</p>
                </div>
              </div>
            
          </div>
          <div className={styles.featureColumnTwo}>
            <div className={styles.featureTwo}>
              <div className={styles.featureTwoTitle}>
                <h4>AI Matches Supply & Demand</h4>
              </div>
            </div>
            <div className={styles.featureThree}>
              <div className={styles.featureThreeTitle}>
                <h4>Communities Connect & Help</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <Footer/>
    </div>
  );
}