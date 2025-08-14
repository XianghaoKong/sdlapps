import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import EmptyState from './EmptyState';

const statusColors = {
  issued: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-700',
  draft: 'bg-yellow-100 text-yellow-800',
};

const formatDate = (d) => (d ? new Date(d).toLocaleString('en-AU') : '—');
const money = (n) => (typeof n === 'number' ? `$${n.toFixed(0)}` : '—');

const TaskList = ({ tasks, setTasks, setEditingTask, isAdmin }) => {
  const { user } = useAuth();

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axiosInstance.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete.');
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title="No records found"
        subtitle={
          isAdmin
            ? 'Create a violation using the form above.'
            : 'When a violation is recorded for your vehicle, it will appear here.'
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((t) => (
        <div key={t._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">{t.title || 'Untitled'}</h3>
              <p className="text-gray-700 whitespace-pre-line mt-1">
                {t.description || 'No details'}
              </p>

              <div className="flex flex-wrap gap-2 mt-3 text-sm">
                <span className={`px-2 py-0.5 rounded ${statusColors[t.status] || 'bg-gray-100 text-gray-800'}`}>
                  {t.status || 'issued'}
                </span>
                {t.challanNo && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    Challan: {t.challanNo}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                  Fine: {money(t.fineAmount)}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                  Deadline: {formatDate(t.deadline)}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setEditingTask(t)}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
