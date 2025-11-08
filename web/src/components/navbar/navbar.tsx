import styles from "./navbar.module.css"
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <div className={styles.navbarContainer}>
            <div className={styles.navbar}>
                <Link to="/" className={styles.logo}>TelePod</Link>
                <div className={styles.links}>
                    <Link to="/villages" className={styles.link}>Villages</Link>
                    <Link to="/demo" className={styles.link}>Match Demo</Link>
                    <Link to="/login" className={`${styles.link} ${styles.login}`}>Village Portal</Link>

                </div>
            </div>
        </div>
    )
}