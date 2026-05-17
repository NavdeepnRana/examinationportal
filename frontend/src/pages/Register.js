import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', department: '', enrollYear: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary-600 mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Role</label>
            <select name="role" className="input-field" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input name="name" className="input-field" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input-field" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input-field" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          {form.role === 'teacher' && (
            <div>
              <label className="label">Department</label>
              <input name="department" className="input-field" value={form.department} onChange={handleChange} />
            </div>
          )}
          {form.role === 'student' && (
            <div>
              <label className="label">Enrollment Year</label>
              <input name="enrollYear" className="input-field" value={form.enrollYear} onChange={handleChange} placeholder="2024" />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
