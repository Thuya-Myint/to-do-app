import { useState, useEffect, useRef } from "react";
import { app } from "../config/firebaseconfig";
import { getDatabase, ref, set, push, get, remove } from "firebase/database";

function ToDoApp() {
  const db = getDatabase(app);
  const [status, setStatus] = useState(null);
  const [status1, setStatus1] = useState(null);
  const [todo, setTodo] = useState('');
  const [inPro, setInPro] = useState('');
  const [comple, setComple] = useState('');
  const [todolist, setTodolist] = useState([]);
  const [prolist, setProlist] = useState([]);
  const [comlist, setComlist] = useState([]);
  const [activeTask, setActivetask] = useState(null);
  const [isDragging, setIsDragging] = useState(false); 
  const [draggedIndex, setDraggedIndex] = useState(null);

  const dragRef = useRef({});

  const addToPlan = async (task, destination) => {
    const docRef = push(ref(db, "plan/" + destination));
    set(docRef, { name: task });
  };

  useEffect(() => {
    const fetchData = async () => {
      await showToDo();
      await showInPro();
      await showComple();
    };
    fetchData();
  }, []);

  const handleDragStart = (sta, item, id, index) => {
    setIsDragging(true);
    setActivetask(item);
    setStatus(sta);
    setDraggedIndex(index);
    dragRef.current = { sta, item, id }; // Store dragging information
  };

  const handleDrop = () => {
    if (isDragging) {
      const { sta, item, id } = dragRef.current;
      if (sta !== status1) {
        addToPlan(item, status1);
        deletePlan(sta, id);
        updateLists(sta, id);
      }
      setIsDragging(false);
    }
    showToDo();showInPro();showComple();
  };
//this function updateLists create arraylist except dragged One
  const updateLists = (sta, id) => {
    if (sta === 'todo') {
      setTodolist(todolist.filter((_, index) => index !== draggedIndex));
    } else if (sta === 'progress') {
      setProlist(prolist.filter((_, index) => index !== draggedIndex));
    } else if (sta === 'completed') {
      setComlist(comlist.filter((_, index) => index !== draggedIndex));
    }
  };

  const showToDo = async () => {
    const dbReftodo = ref(db, "plan/todo");
    const snapshot = await get(dbReftodo);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const temp = Object.keys(myData).map(myFireId => ({
        ...myData[myFireId],
        planId: myFireId
      }));
      setTodolist(temp);
    }
  };

  const showInPro = async () => {
    const dbRefinpro = ref(db, "plan/progress");
    const snapshot = await get(dbRefinpro);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const temp = Object.keys(myData).map(myFireId => ({
        ...myData[myFireId],
        planId: myFireId
      }));
      setProlist(temp);
    }
  };

  const showComple = async () => {
    const dbRefcom = ref(db, "plan/completed");
    const snapshot = await get(dbRefcom);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const temp = Object.keys(myData).map(myFireId => ({
        ...myData[myFireId],
        planId: myFireId
      }));
      setComlist(temp);
    }
  };

  const addToDo = async (event) => {
    event.preventDefault();
    if (todo.trim() === '') {
      alert("Task cannot be empty");
      return;
    }
    const newDocref = push(ref(db, "plan/todo"));
    set(newDocref, { name: todo })
      .then(() => {
        alert("Data saved successfully");
        showToDo();
        setTodo('');
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  const addInPro = async (event) => {
    event.preventDefault();
    if (inPro.trim() === '') {
      alert("Task cannot be empty");
      return;
    }
    const newDocref = push(ref(db, "plan/progress"));
    set(newDocref, { name: inPro })
      .then(() => {
        alert("Data saved successfully");
        setInPro('');
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  const addComple = async (event) => {
    event.preventDefault();
    if (comple.trim() === '') {
      alert("Task cannot be empty");
      return;
    }
    const newDocref = push(ref(db, "plan/completed"));
    set(newDocref, { name: comple })
      .then(() => {
        alert("Data saved successfully");
        setComple('');
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  const deletePlan = async (source, id) => {
    const dbref = ref(db, "plan/" + source + "/" + id);
    await remove(dbref);
  };

  return (
    <div className="p-10 flex flex-col h-screen text-lg items-center">
      <form className="flex sm:flex-row flex-col" onSubmit={addToDo}>
        <input
          type="text"
          placeholder="New Task"
          className="border-2 px-3 py-2 flex-shrink-1"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <input
          type="submit"
          value="Add Task"
          className="bg-blue-500 px-4 py-2 sm:ms-1 rounded-sm border-1 border-blue-500 sm:mt-0 mt-2"
        />
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:gap-10 md:gap-2 gap-0">
        <div className="mt-10">
          <div className="text-center bg-orange-300 py-2">To Do List</div>
          <section className="w-56 h-80 border-2 px-2 py-1 overflow-auto" onDragEnter={() => setStatus1("todo")} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {todolist.map((item, index) => (
              <div key={index}>
                <div draggable onDragStart={() => handleDragStart("todo", item.name, item.planId, index)} 
                  className="text-center py-2 rounded-md bg-orange-400 mb-2 cursor-grab toDoCard">{item.name}</div>
              </div>
            ))}
          </section>
        </div>
        <div className="mt-10">
          <div className="text-center bg-blue-300 py-2">In Progress</div>
          <section className="w-56 h-80 border-2 px-2 py-1 overflow-auto" onDragEnter={() => setStatus1("progress")} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {prolist.map((item, index) => (
              <div key={index}>
                <div draggable onDragStart={() => handleDragStart("progress", item.name, item.planId, index)} 
                  className="text-center py-2 rounded-md bg-blue-400 mb-2 cursor-grab toDoCard">{item.name}</div>
              </div>
            ))}
          </section>
        </div>
        <div className="mt-10">
          <div className="text-center bg-green-300 py-2">Completed Task</div>
          <div className="w-56 h-80 border-2 px-2 py-1 overflow-auto" onDragEnter={() => setStatus1("completed")} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {comlist.map((item, index) => (
              <div key={index}>
                <div draggable onDragStart={() => handleDragStart("completed", item.name, item.planId, index)} 
                  className="text-center py-2 rounded-md bg-green-400 mb-2 cursor-grab toDoCard">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToDoApp;

