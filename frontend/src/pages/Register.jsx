import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    role: 'driver',        // 新增：默认 driver
    plate: '',             // 仅 driver 用
    address: '',           // 仅 driver 用
    adminKey: ''           // 仅 admin 用
  });

  const navigate = useNavigate();

  const onChange = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  const handleRoleChange = (e) => {
    const role = e.target.value;
    // 切换角色时清空另一侧特有字段，避免误传
    setFormData(f => ({
      ...f,
      role,
      plate: role === 'driver' ? f.plate : '',
      address: role === 'driver' ? f.address : '',
      adminKey: role === 'admin' ? f.adminKey : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 构造最小有效载荷：公共字段 + 角色特有字段
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'driver' ? {
          plate: formData.plate,
          address: formData.address
        } : {}),
        ...(formData.role === 'admin' ? {
          adminKey: formData.adminKey
        } : {})
      };

      await axiosInstance.post('/api/auth/register', payload);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Registration failed. Please try again.';
      alert(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        {/* 公共字段 */}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={onChange('name')}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange('email')}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange('password')}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        {/* 角色选择 */}
        <select
          value={formData.role}
          onChange={handleRoleChange}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>

        {/* driver 专属字段 */}
        {formData.role === 'driver' && (
          <>
            <input
              type="text"
              placeholder="Vehicle Plate"
              value={formData.plate}
              onChange={onChange('plate')}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={onChange('address')}
              className="w-full mb-4 p-2 border rounded"
              required
            />
          </>
        )}

        {/* admin 专属字段 */}
        {formData.role === 'admin' && (
          <input
            type="text"
            placeholder="Admin Key"
            value={formData.adminKey}
            onChange={onChange('adminKey')}
            className="w-full mb-4 p-2 border rounded"
            required
          />
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
