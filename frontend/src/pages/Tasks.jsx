import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user?.token) return;
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // 后端已按角色过滤：admin=全部，driver=只看自己
        setTasks(Array.isArray(response.data) ? response.data : (response.data?.data || []));
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto p-6">
      {/* 只有 admin 显示表单（创建/编辑）。driver 只看列表 */}
      {isAdmin && (
        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      )}

      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        setEditingTask={setEditingTask}
        isAdmin={isAdmin}  // 可选：你若想在列表隐藏编辑/删除按钮，用这个做条件
      />
    </div>
  );
};

export default Tasks;
