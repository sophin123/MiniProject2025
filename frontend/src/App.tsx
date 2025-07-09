import { useState } from "react";
import "./App.css";

interface Assignment {
  id: string;
  person: string;
  task: string;
  hasCompleted: boolean;
}

function App() {
  const person = ["Sophin", "Pramila", "Steven"];
  const tasks = ["Vacuum", "Kitchen", "Bathroom"];
  const [completedTask, setCompletedTask] = useState(new Set());
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();

    const diff = d.getDate() - day + (day === 0 ? -6 : 1);

    return new Date(d.setDate(diff));
  }

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Get week number for task rotation
  function getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);

    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;

    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  // Togle Task Completion
  function toggleTask(taskId: string): void {
    const newCompletedTask = new Set(completedTask);

    if (newCompletedTask.has(taskId)) {
      newCompletedTask.delete(taskId);
    } else {
      newCompletedTask.add(taskId);
    }

    console.log("new completed task", newCompletedTask);
    setCompletedTask(newCompletedTask);
  }

  // Generate assignments for current week
  const getWeeklyAssignments = (): Assignment[] => {
    const weekNum = getWeekNumber(currentWeek);

    return tasks.map((task, index) => {
      const personIndex = (weekNum + index) % person.length;
      const taskId = `${formatDate(currentWeek)} - ${task}`;

      return {
        id: taskId,
        person: person[personIndex],
        task,
        hasCompleted: completedTask.has(taskId),
      };
    });
  };

  const assignments = getWeeklyAssignments();
  const completedCount = assignments.filter((a) => a.hasCompleted).length;
  console.log("Completed Count", completedCount);
  const progressBarPercentage =
    completedCount > 0 ? (completedCount / assignments.length) * 100 : 0;

  const groupAssignments: Record<string, Assignment[]> = assignments.reduce(
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

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="card-header bg-primary text-white">
        <h1 className="h3 mb-0 text-center">🧹 Cleaning Schedule</h1>
        <p className="text-center mb-0 mt-3 opacity-75">
          Bathroom • Vacuum • Kitchen
        </p>
      </div>

      {/* Week Navigation */}
      <div className="card-body border-bottom-0">
        <div className="row align-items-center mt-2">
          <div className="col-4 text-start">
            <button
              className="btn btn-outline-primary "
              onClick={() => changeWeek(-1)}
            >
              {" "}
              ← Previous Week
            </button>
          </div>

          <div className="col-4 text-center">
            <h4 className="mb-0">{formatDate(currentWeek)}</h4>
          </div>

          <div className="col-4 text-end">
            <button
              className="btn btn-outline-primary "
              onClick={() => changeWeek(1)}
            >
              {" "}
              Next Week →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2 mt-2">
          <span>
            Progess: {completedCount} / {assignments.length} tasks completed
          </span>
          <span>{Math.round(progressBarPercentage)}%</span>
        </div>

        <div className="progress" style={{ height: "10px" }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${progressBarPercentage}%` }}
            aria-valuenow={progressBarPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* Assignment */}
      <div className="card-body">
        <div className="row">
          {Object.entries(groupAssignments).map(([person, tasks]) => (
            <div key={person} className="col-md-4 mb-4 mt-4">
              <div className="card h-100 border-2">
                <div className="card-header ">
                  <div className="card-title text-center">
                    <span className="badge me-2">👤</span>
                    {person}
                  </div>
                </div>
                <div className="card-body">
                  {tasks.map((assignment) => (
                    <div key={assignment.id} className="mb-3">
                      <div className="form-check d-flex gap-2">
                        <input
                          type="checkbox"
                          id={assignment.id}
                          className="form-check-input fs-5"
                          checked={assignment.hasCompleted}
                          onChange={() => toggleTask(assignment.id)}
                        />
                        <label
                          htmlFor={assignment.id}
                          className={`form-check-label fs-5 ${
                            assignment.hasCompleted
                              ? "text-muted text-decoration-line-through"
                              : ""
                          }`}
                        >
                          <strong>{assignment.task}</strong>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
