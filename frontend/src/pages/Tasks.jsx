import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to fetch tasks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse rounded-lg bg-white p-6 shadow">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 rounded mb-2" />
          <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="Oops, failed to load violations"
          subtitle={err}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
    
      {isAdmin ? (
        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      ) : null}

      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        setEditingTask={setEditingTask}
        isAdmin={isAdmin}
      />

      {!isAdmin && tasks.length === 0 && (
        <EmptyState
          title="No violations yet 🎉"
          subtitle="You currently don't have any recorded traffic violations."
        />
      )}
    </div>
  );
};

export default Tasks;
