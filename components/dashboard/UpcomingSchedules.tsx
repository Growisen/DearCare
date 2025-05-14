"use client"

import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Calendar, CheckCircle, Circle, Clock, MapPin, Plus, X, Loader2 } from "lucide-react"
import { addTodo, updateTodoStatus, deleteTodo, Todo } from "@/app/actions/dashboard-actions"
import toast from 'react-hot-toast';

interface UpcomingSchedulesProps {
  todosData?: Todo[];
}

export default function TodoScheduler({ todosData }: UpcomingSchedulesProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newUrgent, setNewUrgent] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTodoIds, setLoadingTodoIds] = useState<string[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Format date values
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  // Fetch todos on component mount
  useEffect(() => {
    if (todosData) {
      setTodos(todosData);
      setIsLoading(false);
    }
  }, [todosData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    setNewDate(selectedDate);
    
    if (selectedDate < today) {
      setDateError(true);
    } else {
      setDateError(false);
      validateTimeWithDate(selectedDate, newTime);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = e.target.value;
    
    setNewTime(selectedTime);
    
    validateTimeWithDate(newDate, selectedTime);
  };

  const validateTimeWithDate = (date: string, time: string) => {
    if (!time || !date) {
      setTimeError(false);
      return;
    }

    if (date === today) {
      if (time < currentTime) {
        setTimeError(true);
      } else {
        setTimeError(false);
      }
    } else {
      setTimeError(false);
    }
  };

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    if (dateError || timeError) return;
    
    setIsAddingTodo(true);
    
    try {
      // Format date display name (Today, Tomorrow, etc.)
      let displayDate = "Today";
      const selectedDate = new Date(newDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (newDate) {
        if (newDate === today) {
          displayDate = "Today";
        } else if (
          selectedDate.getDate() === tomorrow.getDate() &&
          selectedDate.getMonth() === tomorrow.getMonth() &&
          selectedDate.getFullYear() === tomorrow.getFullYear()
        ) {
          displayDate = "Tomorrow";
        } else {
          // Format as "Mon, Apr 12" for other dates
          displayDate = selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          });
        }
      }
      
      // Format time display (e.g., "13:00" to "1:00 PM")
      let displayTime = "No time set";
      if (newTime) {
        const timeParts = newTime.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // convert 0 to 12
        displayTime = `${hours}:${minutes} ${ampm}`;
      }
      
      const todoData = {
        text: newTodo,
        time: displayTime,
        date: displayDate,
        location: newLocation || "Not specified",
        urgent: newUrgent,
        completed: false
      };

      const result = await addTodo(todoData);
      
      if (result.success && result.todo) {
        setTodos([result.todo, ...todos]);
        resetForm();
        toast.success("Your new task has been added successfully");
      } else {
        toast.error(result.error || "Failed to add task");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add your task. Please try again.");
    } finally {
      setIsAddingTodo(false);
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      setLoadingTodoIds(prev => [...prev, id]);
      
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const newStatus = !todo.completed;
      const result = await updateTodoStatus(id, newStatus);
      
      if (result.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed: newStatus } : todo
        ));
      } else {
        toast.error(result.error || "Failed to update task status");
      }
    } catch (error) {
      console.error("Error toggling task status:", error);
      toast.error("Failed to update task status. Please try again.");
    } finally {
      setLoadingTodoIds(prev => prev.filter(todoId => todoId !== id));
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setLoadingTodoIds(prev => [...prev, id]);
      
      const result = await deleteTodo(id);
      
      if (result.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete your task. Please try again.");
    } finally {
      setLoadingTodoIds(prev => prev.filter(todoId => todoId !== id));
    }
  };

  const resetForm = () => {
    setNewTodo("");
    setNewTime("");
    setNewDate("");
    setNewLocation("");
    setNewUrgent(false);
    setDateError(false);
    setTimeError(false);
    setShowForm(false);
  };

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-md font-semibold text-gray-800">Todo Scheduler</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors disabled:opacity-70"
        >
          {showForm ? (
            <X className="w-4 h-4 text-emerald-600" />
          ) : (
            <Plus className="w-4 h-4 text-emerald-600" />
          )}
        </button>
      </div>

      {showForm ? (
        <div className="mb-4 p-3 border border-emerald-100 rounded-lg bg-emerald-50/30 relative">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="w-full p-2 rounded border border-gray-200 text-sm text-gray-700"
              disabled={isAddingTodo}
            />
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={newTime}
                  onChange={handleTimeChange}
                  className={`text-xs text-gray-800 border-none outline-none ${timeError ? 'ring-2 ring-red-400' : ''}`}
                  disabled={isAddingTodo}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={newDate}
                  onChange={handleDateChange}
                  min={today}
                  className={`text-xs text-gray-800 border-none outline-none ${dateError ? 'ring-2 ring-red-400' : ''}`}
                  disabled={isAddingTodo}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-gray-100 flex-grow">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Location"
                  className="text-xs text-gray-800 border-none outline-none w-full"
                  disabled={isAddingTodo}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-red-500">Please select today or a future date</p>
            )}
            {timeError && (
              <p className="text-xs text-red-500">Please select a future time for today&apos;s tasks</p>
            )}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={newUrgent}
                  onChange={() => setNewUrgent(!newUrgent)}
                  className="rounded text-rose-500"
                  disabled={isAddingTodo}
                />
                Mark as urgent
              </label>
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                  disabled={isAddingTodo}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTodo}
                  disabled={isAddingTodo || dateError || timeError || newTodo.trim() === ""}
                  className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 ${
                    isAddingTodo || dateError || timeError || newTodo.trim() === "" 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  }`}
                >
                  {isAddingTodo && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isAddingTodo ? "Adding..." : "Add Task"}
                </button>
              </div>
            </div>
          </div>
          
          {isAddingTodo && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto custom-scrollbar" style={{ height: "calc(100% - 60px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-sm text-gray-500">Loading tasks...</span>
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
              <div className="mb-2">
                <Calendar className="w-10 h-10 mx-auto opacity-20" />
              </div>
              <p className="text-sm mb-1">No tasks scheduled</p>
              <p className="text-xs">Click the + button to add your first task</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo.id} 
                className={`p-3 rounded-xl transition-colors border relative group
                  ${todo.completed 
                    ? "bg-gray-50/50 border-gray-100/20" 
                    : "bg-blue-50/30 hover:bg-blue-50/50 border-blue-100/20"}`}
              >
                {loadingTodoIds.includes(todo.id) && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <button 
                    onClick={() => toggleComplete(todo.id)}
                    disabled={loadingTodoIds.includes(todo.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${todo.completed 
                        ? "bg-emerald-100/50 text-emerald-600" 
                        : "bg-blue-100/50 text-blue-600 hover:bg-blue-100"}`}
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-gray-800 text-sm font-medium flex items-center gap-2
                      ${todo.completed ? "line-through text-gray-500" : ""}`}>
                      {todo.text}
                      {todo.urgent && !todo.completed && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100/50 text-rose-600 text-xs">
                          Urgent
                        </span>
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={loadingTodoIds.includes(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 ml-11">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{todo.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{todo.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{todo.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  )
}