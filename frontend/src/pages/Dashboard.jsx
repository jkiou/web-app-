import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { token, user, showToast } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // null for new, task object for edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('PENDING');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (priorityFilter) queryParams.append('priority', priorityFilter);
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`${API_URL}/tasks?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setTasks(data.data.tasks);
      } else {
        showToast(data.message || 'Failed to fetch tasks.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, could not load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, token]); // Re-fetch on filter change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  // Open modal for Create
  const handleNewTask = () => {
    setCurrentTask(null);
    setTitle('');
    setDescription('');
    setTaskStatus('PENDING');
    setTaskPriority('MEDIUM');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setIsModalOpen(true);
  };

  // Create / Update Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const body = { title, description, status: taskStatus, priority: taskPriority };
    const url = currentTask ? `${API_URL}/tasks/${currentTask.id}` : `${API_URL}/tasks`;
    const method = currentTask ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(data.message || 'Task saved successfully!', 'success');
        setIsModalOpen(false);
        fetchTasks();
      } else {
        showToast(data.message || 'Could not save task.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast('Task deleted successfully.', 'success');
        fetchTasks();
      } else {
        showToast(data.message || 'Failed to delete task.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, deletion failed.', 'error');
    }
  };

  // Fast Status Change on Card Click
  const toggleTaskStatus = async (task) => {
    const nextStatusMap = {
      'PENDING': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'PENDING'
    };
    const newStatus = nextStatusMap[task.status] || 'PENDING';

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        showToast(`Task marked as ${newStatus.replace('_', ' ')}`, 'success');
        fetchTasks();
      } else {
        showToast(data.message || 'Failed to update task status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, update failed.', 'error');
    }
  };

  // Priority border colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'var(--danger)';
      case 'MEDIUM': return 'var(--warning)';
      case 'LOW': return 'var(--secondary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {user?.role === 'ADMIN' && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            <strong>🛡️ Admin Privileges Detected:</strong> You are logged in as an Administrator. You can access the system management portal.
          </p>
          <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
            Open Admin Panel
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Workspace Tasks</h2>
          <p style={{ color: 'var(--text-muted)' }}>Hello, {user?.name}. Monitor and manage your assignments.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewTask}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Task
        </button>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            type="text"
            placeholder="Search task title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem' }}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            Search
          </button>
        </form>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {(statusFilter || priorityFilter || searchTerm) && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setSearchTerm('');
            }}
            style={{ padding: '0.5rem 1rem' }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Tasks Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            There are no tasks that match your search filters. Try adjusting your queries or add a new task.
          </p>
          <button className="btn btn-primary" onClick={handleNewTask}>Add First Task</button>
        </div>
      ) : (
        <div className="tasks-section">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="task-card" 
              style={{ '--task-accent': getPriorityColor(task.priority) }}
            >
              <div className="task-info">
                <h3 className="task-title">
                  {task.title}
                  {user?.role === 'ADMIN' && task.user && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 'normal' }}>
                      (Assignee: {task.user.name})
                    </span>
                  )}
                </h3>
                {task.description && <p className="task-desc">{task.description}</p>}
                
                <div className="task-meta">
                  <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span 
                    className={`badge badge-status-${task.status.toLowerCase().replace('_', '')}`}
                    onClick={() => toggleTaskStatus(task)}
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle status"
                  >
                    {task.status.replace('_', ' ')} 🔄
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <button 
                  className="btn btn-secondary btn-icon" 
                  onClick={() => handleEditTask(task)}
                  title="Edit task"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  className="btn btn-danger btn-icon" 
                  onClick={() => handleDeleteTask(task.id)}
                  title="Delete task"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>
              {currentTask ? 'Edit Task Info' : 'Create New Task'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div className="input-group">
                <label className="input-label">Task Title</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Task title details..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Task Description</label>
                <textarea
                  className="input-field"
                  placeholder="Explain details of the task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Status</label>
                  <select
                    className="filter-select"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem' }}
                    disabled={isSubmitting}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Priority</label>
                  <select
                    className="filter-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem' }}
                    disabled={isSubmitting}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving changes...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
