import { useState } from 'react';
import { register } from '../utils/api';
import styles from './dashboard.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form);
    if (res.id) setMessage('Registration successful! You can now log in.');
    else setMessage(res.message || 'Registration failed');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required className={styles.input} />
        <input name="email" placeholder="Email" onChange={handleChange} required className={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className={styles.input} />
        <button type="submit" className={`${styles.button} ${styles.buttonSubmit}`}>Register</button>
      </form>
      <div className={styles.message}>{message}</div>
    </div>
  );
}