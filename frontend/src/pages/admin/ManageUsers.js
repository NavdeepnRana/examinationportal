import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', enrollYear: '' });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&limit=10&role=${role}&search=${search}`)
      .then((res) => {
        setUsers(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      toast.success('User created');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'student', department: '', enrollYear: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      toast.success('Status updated');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">+ Add User</button>
      </div>

      {showForm && (
        <form onSubmit={createUser} className="card mb-6 grid sm:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn-primary sm:col-span-2">Create User</button>
        </form>
      )}

      <div className="flex gap-4 mb-6">
        <input type="search" placeholder="Search..." className="input-field max-w-xs" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-field max-w-xs" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b dark:border-gray-700/50">
                  <td className="py-3 px-2">{u.name}</td>
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2 capitalize">{u.role}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button type="button" onClick={() => toggleStatus(u._id)} className="text-primary-600 hover:underline text-xs">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default ManageUsers;
