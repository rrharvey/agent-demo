import { Link } from '@tanstack/react-router'

export function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Time Entry Dashboard</h2>
      <div className="dashboard-actions">
        <Link to="/time-entries" className="action-card">
          <h3>View Time Entries</h3>
          <p>View and manage your time entries</p>
        </Link>
        <Link to="/time-entries/new" className="action-card">
          <h3>Add New Entry</h3>
          <p>Record time spent on a project</p>
        </Link>
      </div>
    </div>
  )
}
