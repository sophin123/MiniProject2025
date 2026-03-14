import { useState, useEffect } from "react";

interface Assignment {
  id: string;
  person: string;
  task: string;
  hasCompleted: boolean;
}

function App() {

  const people = ["Lakas Maharjan", "Steven", "Pramila", "Sophin"];
  const tasks = ["Vacuum", "Kitchen", "Bathroom"];
  
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  // Load completed tasks from memory on mount
  useEffect(() => {
    const stored = localStorage.getItem('completedTasks');
    if (stored) {
      try {
        setCompletedTasks(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);

  // Save completed tasks to memory whenever they change
  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(Array.from(completedTasks)));
  }, [completedTasks]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Calculate a stable rotation index based on days since a fixed reference point
  function getRotationIndex(date: Date): number {
    // Use a fixed reference date (e.g., Jan 1, 2024)
    const referenceDate = new Date(2024, 0, 1);
    referenceDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDiff = Math.floor((date.getTime() - referenceDate.getTime()) / 86400000);
    
    // Calculate weeks since reference date
    const weeksSinceReference = Math.floor(daysDiff / 7);
    
    return weeksSinceReference;
  }

  function toggleTask(taskId: string): void {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  }

  function isCurrentWeek(): boolean {
    const today = getWeekStart(new Date());
    return currentWeek.getTime() === today.getTime();
  }

  function goToToday(): void {
    setCurrentWeek(getWeekStart(new Date()));
  }

  const getWeeklyAssignments = (): Assignment[] => {
    const rotationIndex = getRotationIndex(currentWeek);
    return tasks.map((task, index) => {
      const personIndex = (rotationIndex + index) % people.length;
      const taskId = `${formatDate(currentWeek)}-${task}`;
      return {
        id: taskId,
        person: people[personIndex],
        task,
        hasCompleted: completedTasks.has(taskId),
      };
    });
  };

  const assignments = getWeeklyAssignments();
  const completedCount = assignments.filter((a) => a.hasCompleted).length;
  const progressPercentage = completedCount > 0 ? (completedCount / assignments.length) * 100 : 0;

  const groupedAssignments: Record<string, Assignment[]> = assignments.reduce(
    (acc, assignment) => {
      if (!acc[assignment.person]) {
        acc[assignment.person] = [];
      }
      acc[assignment.person].push(assignment);
      return acc;
    },
    {} as Record<string, Assignment[]>
  );

  const changeWeek = (direction: number): void => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const getWeekEndDate = (): string => {
    const endDate = new Date(currentWeek);
    endDate.setDate(endDate.getDate() + 6);
    return formatDate(endDate);
  };

  return (
    <div className="min-vh-100 bg-light">
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="container py-4">
        <div className="card shadow-sm">
          {/* Header */}
          <div className="card-header bg-primary text-white py-4">
            <h1 className="h3 mb-2 text-center">🧹 Weekly Cleaning Schedule</h1>
            <p className="text-center mb-0 opacity-75 small">
              Bathroom • Vacuum • Kitchen
            </p>
          </div>

          {/* Week Navigation */}
          <div className="card-body border-bottom">
            <div className="row align-items-center g-2">
              <div className="col-12 col-md-4 text-center text-md-start">
                <button
                  className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                  onClick={() => changeWeek(-1)}
                >
                  ← Previous
                </button>
              </div>

              <div className="col-12 col-md-4 text-center">
                <div className="d-flex flex-column align-items-center gap-2">
                  <h5 className="mb-0">
                    {formatDate(currentWeek)} - {getWeekEndDate()}
                  </h5>
                  {isCurrentWeek() && (
                    <span className="badge bg-success">Current Week</span>
                  )}
                  {!isCurrentWeek() && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={goToToday}
                    >
                      Go to Today
                    </button>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4 text-center text-md-end">
                <button
                  className="btn btn-outline-primary btn-sm w-100 w-md-auto"
                  onClick={() => changeWeek(1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card-body border-bottom">
            <div className="d-flex justify-content-between mb-2 align-items-center">
              <span className="small">
                <strong>Progress:</strong> {completedCount} / {assignments.length} completed
              </span>
              <span className="badge bg-primary">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress" style={{ height: "12px" }}>
              <div
                className="progress-bar bg-success progress-bar-striped"
                role="progressbar"
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>

          {/* Assignments */}
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(groupedAssignments).map(([person, personTasks]) => (
                <div key={person} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-primary">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0 text-center">
                        <span className="me-2">👤</span>
                        <strong>{person}</strong>
                      </h6>
                    </div>
                    <div className="card-body">
                      <ul className="list-unstyled mb-0">
                        {personTasks.map((assignment) => (
                          <li key={assignment.id} className="mb-3">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id={assignment.id}
                                className="form-check-input"
                                checked={assignment.hasCompleted}
                                onChange={() => toggleTask(assignment.id)}
                                style={{ cursor: 'pointer' }}
                              />
                              <label
                                htmlFor={assignment.id}
                                className={`form-check-label ${
                                  assignment.hasCompleted
                                    ? "text-muted text-decoration-line-through"
                                    : ""
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                {assignment.task}
                              </label>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;