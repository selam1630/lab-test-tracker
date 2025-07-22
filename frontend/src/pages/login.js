import { useState } from 'react';
import { login } from '../utils/api';
import styles from './dashboard.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await login(form);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setMessage('Login successful!');
      // Redirect to dashboard, e.g. router.push('/dashboard')
    } else {
      setMessage(res.message || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} required className={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className={styles.input} />
        <button type="submit" className={`${styles.button} ${styles.buttonSubmit}`}>Login</button>
      </form>
      <div className={styles.message}>{message}</div>
    </div>
  );
}