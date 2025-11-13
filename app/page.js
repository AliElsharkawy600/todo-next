"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Calendar, CheckCircle2, CircleDashed } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "No Date Available";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTaskTimestamp = (task) => task.deadline || task.createdAt;

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || "Failed to fetch tasks.");
      }

      data.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        return (
          new Date(getTaskTimestamp(a)) - new Date(getTaskTimestamp(b))
        );
      });

      setTasks(data);
    } catch (err) {
      setError(err.message || "Unknown error fetching tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-16 text-slate-100 sm:px-10 lg:px-20">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Task Overview</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/tasks"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-400"
          >
            Add New Task
          </Link>
        </div>
      </header>

      <section className="mt-12">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16">
            <Loader2 className="mr-3 h-7 w-7 animate-spin text-indigo-300" />
            <span className="text-lg text-slate-200">Fetching tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            <p className="text-lg">No tasks yet. Tap “Add New Task” to create your first todo.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} refreshTasks={fetchTasks} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function TaskCard({ task, refreshTasks }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const taskTimestamp = getTaskTimestamp(task);
  const isOverdue = !task.completed && new Date(taskTimestamp) < new Date();

  const toggleComplete = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/todos/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }

      await refreshTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{task.name}</h3>
          <p className="mt-2 text-sm text-slate-300">{task.description}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            task.completed
              ? "bg-emerald-500/20 text-emerald-200"
              : isOverdue
              ? "bg-red-500/20 text-red-200"
              : "bg-indigo-500/20 text-indigo-200"
          }`}
        >
          {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
          {task.completed ? "Completed" : isOverdue ? "Overdue" : "In progress"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
        <Calendar className="h-4 w-4" />
        <span>{formatDate(taskTimestamp)}</span>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={toggleComplete}
          disabled={isUpdating}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            task.completed
              ? "border border-indigo-500/60 bg-transparent text-indigo-200 hover:border-indigo-400"
              : "bg-indigo-500 text-white hover:bg-indigo-400"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
        </button>
      </div>
    </article>
  );
}
