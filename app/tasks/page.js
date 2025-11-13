"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Loader2, Edit2, XCircle } from "lucide-react";

export default function Tasks() {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (
      !newTaskName.trim() ||
      !newTaskDescription.trim() ||
      !newTaskDeadline
    ) {
      setError("Name, Description, and Deadline are required to create a task.");
      return;
    }

    setIsAdding(true);
    setError(null);

    const taskData = {
      name: newTaskName.trim(),
      description: newTaskDescription.trim(),
      deadline: new Date(newTaskDeadline).toISOString(),
    };

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const newTask = await response.json();

      if (!response.ok) {
        throw new Error(newTask.error || "Failed to add task.");
      }

      setNewTaskName("");
      setNewTaskDescription("");
      setNewTaskDeadline("");

      window.location.href = "/";
    } catch (err) {
      setError(`Error adding task: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              <span className="flex items-center gap-3">
                <Edit2 className="w-7 h-7 text-blue-600" />
                Add a new task
              </span>
            </h1>
            <p className="mt-2 text-gray-600">
              Fill out the form to create a todo. After saving, you’ll be returned to the dashboard.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            ← Back to home
          </Link>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between shadow-md">
            <span className="flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Task details</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task Name (e.g., Finish CRUD API)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black"
              disabled={isAdding}
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task Description (e.g., Outline REST endpoints and deploy)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black min-h-[120px]"
              disabled={isAdding}
            />
            <input
              type="datetime-local"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-black"
              disabled={isAdding}
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:bg-blue-400"
              disabled={
                isAdding ||
                !newTaskName.trim() ||
                !newTaskDescription.trim() ||
                !newTaskDeadline
              }
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding Task...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Task
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
