import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lab Test Result Tracker</h1>
      <p className={styles.message}>{message}</p>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link href="/login"><button className={`${styles.button} ${styles.buttonEdit}`}>Login</button></Link>
        <Link href="/register"><button className={`${styles.button} ${styles.buttonSubmit}`}>Register</button></Link>
        <Link href="/dashboard"><button className={`${styles.button} ${styles.buttonCancel}`}>Dashboard</button></Link>
      </div>
    </div>
  );
}