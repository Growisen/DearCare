"use client"

import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Calendar, CheckCircle, Circle, Clock, MapPin, Plus, X, Loader2 } from "lucide-react"
import { addTodo, updateTodoStatus, deleteTodo, Todo } from "@/app/actions/dashboard/dashboard-actions"
import toast from 'react-hot-toast';
import ConfirmationModal from "../common/ConfirmationModal"
import ModalPortal from "../ui/ModalPortal"

interface UpcomingSchedulesProps {
  todosData?: Todo[];
  isLoading?: boolean;
}

export default function TodoScheduler({ todosData, isLoading = false }: UpcomingSchedulesProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newUrgent, setNewUrgent] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [loadingTodoIds, setLoadingTodoIds] = useState<string[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  useEffect(() => {
    if (todosData) {
      setTodos(todosData);
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
          displayDate = selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          });
        }
      }
      
      let displayTime = "No time set";
      if (newTime) {
        const timeParts = newTime.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
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

  const confirmDeleteTodo = (id: string) => {
    setTodoToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteTodo = async () => {
    if (!todoToDelete) return;
    
    try {
      setIsDeleting(true);
      setLoadingTodoIds(prev => [...prev, todoToDelete]);
      
      const result = await deleteTodo(todoToDelete);
      
      if (result.success) {
        setTodos(todos.filter(todo => todo.id !== todoToDelete));
        toast.success("Task deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete your task. Please try again.");
    } finally {
      setIsDeleting(false);
      setLoadingTodoIds(prev => prev.filter(todoId => todoId !== todoToDelete));
      setShowDeleteModal(false);
      setTodoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTodoToDelete(null);
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
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-white to-indigo-50/30 hover:from-white 
      hover:to-indigo-50/30 border border-slate-200 shadow-none rounded-sm h-[383px]"
    >
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center
       justify-between mb-3 sm:mb-4 border-b border-indigo-100 pb-2"
      >
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <div className="mr-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-sm sm:text-md font-medium text-slate-800">Todo Scheduler</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={isLoading}
            className="p-1.5 rounded-sm bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-70
             disabled:cursor-not-allowed"
          >
            {showForm ? (
              <X className="w-4 h-4 text-indigo-700" />
            ) : (
              <Plus className="w-4 h-4 text-indigo-700" />
            )}
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="mb-3 p-3 border border-indigo-100 rounded-sm bg-white shadow-none relative">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="w-full p-2 rounded-sm border border-indigo-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 text-sm text-slate-700"
              disabled={isAddingTodo}
            />
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-sm border border-amber-200 shadow-none">
                <Clock className="w-4 h-4 text-amber-500" />
                <input
                  type="time"
                  value={newTime}
                  onChange={handleTimeChange}
                  className={`text-xs text-slate-800 border-none outline-none ${timeError ? 'ring-2 ring-red-400' : ''}`}
                  disabled={isAddingTodo}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-sm border border-emerald-200 shadow-none">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <input
                  type="date"
                  value={newDate}
                  onChange={handleDateChange}
                  min={today}
                  className={`text-xs text-slate-800 border-none outline-none ${dateError ? 'ring-2 ring-red-400' : ''}`}
                  disabled={isAddingTodo}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-sm border border-blue-200 shadow-none flex-grow">
                <MapPin className="w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Location"
                  className="text-xs text-slate-800 border-none outline-none w-full"
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
              <label className="flex items-center gap-1.5 text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={newUrgent}
                  onChange={() => setNewUrgent(!newUrgent)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                  disabled={isAddingTodo}
                />
                Mark as urgent
              </label>
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="px-3 py-1 text-xs rounded-sm bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  disabled={isAddingTodo}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTodo}
                  disabled={isAddingTodo || dateError || timeError || newTodo.trim() === ""}
                  className={`px-3 py-1 text-xs rounded-sm flex items-center gap-1.5 ${
                    isAddingTodo || dateError || timeError || newTodo.trim() === "" 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-none"
                  }`}
                >
                  {isAddingTodo && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isAddingTodo ? "Adding..." : "Add Task"}
                </button>
              </div>
            </div>
          </div>
          
          {isAddingTodo && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto custom-scrollbar" style={{ height: "calc(100% - 55px)" }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-2 sm:p-3 rounded-sm border border-slate-100 bg-white/50 
                relative shadow-none animate-pulse"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-sm bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded-sm w-3/4" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 ml-9">
                  <div className="h-3 w-16 bg-slate-200 rounded-sm" />
                  <div className="h-3 w-16 bg-slate-200 rounded-sm" />
                  <div className="h-3 w-16 bg-slate-200 rounded-sm" />
                </div>
              </div>
            ))
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
              <div className="mb-2">
                <Calendar className="w-10 h-10 mx-auto text-indigo-200" />
              </div>
              <p className="text-sm mb-1">No tasks scheduled</p>
              <p className="text-xs">Click the + button to add your first task</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo.id} 
                className={`p-2 sm:p-3 rounded-sm border relative group shadow-none
                  ${todo.completed 
                    ? "bg-slate-50/80 border-slate-200" 
                    : todo.urgent
                      ? "bg-gradient-to-r from-white to-rose-50/40 border-rose-100"
                      : "bg-gradient-to-r from-white to-indigo-50/40 border-indigo-100"}`}
              >
                {loadingTodoIds.includes(todo.id) && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-sm flex items-center
                   justify-center z-10"
                  >
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <button 
                    onClick={() => toggleComplete(todo.id)}
                    disabled={loadingTodoIds.includes(todo.id)}
                    className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 shadow-none
                      ${todo.completed 
                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                        : todo.urgent
                          ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                          : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"}`}
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-slate-800 text-sm font-medium flex items-center gap-2
                      ${todo.completed ? "line-through text-slate-500" : ""}`}>
                      {todo.text}
                      {todo.urgent && !todo.completed && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs border border-rose-200
                         shadow-none"
                        >
                          Urgent
                        </span>
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={() => confirmDeleteTodo(todo.id)} 
                    disabled={loadingTodoIds.includes(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 ml-9">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{todo.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    <span>{todo.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-300">•</span>
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span>{todo.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {showDeleteModal && (
        <ModalPortal>
          <ConfirmationModal
            isOpen={showDeleteModal}
            title="Delete Task"
            message="Are you sure you want to delete this task? This action cannot be undone."
            onConfirm={handleDeleteTodo}
            onCancel={cancelDelete}
            confirmButtonText="Delete"
            cancelButtonText="Cancel" 
            confirmButtonColor="red"
            isLoading={isDeleting}
          />
        </ModalPortal>
      )}
    </Card>
  )
}