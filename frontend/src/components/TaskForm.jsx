import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', deadline: '',
    plate: '', location: '', fine: ''
  });

  const emptyForm = {
    title: '', description: '', deadline: '',
    plate: '', location: '', fine: ''
  };

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        deadline: editingTask.deadline || '',
        plate: '', location: '', fine: ''
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasExtra =
      (formData.plate && formData.plate.trim()) ||
      (formData.location && formData.location.trim()) ||
      (formData.fine && String(formData.fine).trim());

    const alreadyCombined =
      /Vehicle:/i.test(formData.description) ||
      /Location:/i.test(formData.description) ||
      /Fine:/i.test(formData.description);

    const combinedDescription = alreadyCombined || !hasExtra
      ? formData.description
      : `Details: ${formData.description || ''}\n` +
        `Vehicle: ${formData.plate || ''}\n` +
        `Location: ${formData.location || ''}`;
      
    const numericFine = formData.fine ? Number(formData.fine) : undefined;

    const payload = {
      title: formData.title,
      description: combinedDescription,
      deadline: formData.deadline,
      plate: formData.plate?.trim().toUpperCase(), 
      ...(Number.isFinite(numericFine) ? { fine: numericFine } : {}),
    };

    try {
      if (editingTask) {
        const response = await axiosInstance.put(
          `/api/tasks/${editingTask._id}`,
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
      } else {
        const plateForOwner = formData.plate?.trim().toUpperCase();
        if (user?.role === 'admin') {
          if (!plateForOwner) {
            alert('Please enter a License Plate to assign this violation to a driver.');
            return;
          }
          payload.plate = plateForOwner; 
        } else {
         
          alert('Only admin can create violations.');
          return;
        }

        const response = await axiosInstance.post(
          '/api/tasks',
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTasks([...tasks, response.data]);
      }

      setEditingTask(null);
      setFormData(emptyForm);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to save task.';
      alert(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingTask ? 'Edit Violation' : 'Record a Violation'}
      </h1>

      <input
        type="text"
        placeholder="Violation Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Details"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      
      <input
        type="text"
        placeholder="License Plate"
        value={formData.plate}
        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Fine Amount ($)"
        value={formData.fine}
        onChange={(e) => setFormData({ ...formData, fine: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="datetime-local"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingTask ? 'Update Violation' : 'Create Violation'}
      </button>
    </form>
  );
};

export default TaskForm;
