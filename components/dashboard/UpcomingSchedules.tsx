import { useState } from "react"
import { Card } from "../ui/card"
import { Calendar, CheckCircle, Circle, Clock, MapPin, Plus, X } from "lucide-react"
// import { Todo } from "@/types/dashboard.types"

// Update your types.ts to include this interface
interface Todo {
  id: string;
  text: string;
  time: string;
  date: string;
  location: string;
  urgent: boolean;
  completed: boolean;
}

const initialTodos: Todo[] = [
  { 
    id: "1", 
    text: "Staff Meeting at Kochi Branch", 
    time: "2:00 PM", 
    date: "Today",
    location: "Kochi Office", 
    urgent: true,
    completed: false 
  },
  { 
    id: "2", 
    text: "Patient Review - Trivandrum", 
    time: "4:30 PM", 
    date: "Today",
    location: "Virtual",
    urgent: false,
    completed: false 
  },
  { 
    id: "3", 
    text: "New Staff Orientation", 
    time: "10:00 AM", 
    date: "Tomorrow",
    location: "Kaloor Training Center",
    urgent: false,
    completed: false 
  },
  { 
    id: "4", 
    text: "Monthly Report for Kerala Operations", 
    time: "3:00 PM", 
    date: "Friday",
    location: "Docs",
    urgent: false,
    completed: true 
  },
]

export default function TodoScheduler() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newUrgent, setNewUrgent] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

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

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    if (dateError || timeError) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      time: newTime || "No time set",
      date: newDate || "Today",
      location: newLocation || "Not specified",
      urgent: newUrgent,
      completed: false
    };

    setTodos([todo, ...todos]);
    resetForm();
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
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
          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
        >
          {showForm ? (
            <X className="w-4 h-4 text-emerald-600" />
          ) : (
            <Plus className="w-4 h-4 text-emerald-600" />
          )}
        </button>
      </div>

      {showForm ? (
        <div className="mb-4 p-3 border border-emerald-100 rounded-lg bg-emerald-50/30">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="w-full p-2 rounded border border-gray-200 text-sm text-gray-700"
            />
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={newTime}
                  onChange={handleTimeChange}
                  className={`text-xs text-gray-800 border-none outline-none ${timeError ? 'ring-2 ring-red-400' : ''}`}
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
                />
                Mark as urgent
              </label>
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addTodo}
                  disabled={dateError || timeError || newTodo.trim() === ""}
                  className={`px-3 py-1 text-xs rounded ${dateError || timeError || newTodo.trim() === "" 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"}`}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto custom-scrollbar" style={{ height: "calc(100% - 60px)" }}>
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`p-3 rounded-xl transition-colors border relative group
                ${todo.completed 
                  ? "bg-gray-50/50 border-gray-100/20" 
                  : "bg-blue-50/30 hover:bg-blue-50/50 border-blue-100/20"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <button 
                  onClick={() => toggleComplete(todo.id)}
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
                  onClick={() => deleteTodo(todo.id)}
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
          ))}
        </div>
      )}
    </Card>
  )
}