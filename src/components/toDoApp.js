import { useState, useEffect, useRef } from "react";
import { app } from "../config/firebaseconfig";
import { getDatabase, ref, set, push,onValue, get, remove } from "firebase/database";

function ToDoApp() {
  const db = getDatabase(app);
  const [status1, setStatus1] = useState(null);
  const [todo, setTodo] = useState('');
  const [todolist, setTodolist] = useState([]);
  const [prolist, setProlist] = useState([]);
  const [comlist, setComlist] = useState([]);
  const [isDragging, setIsDragging] = useState(false); 
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [update, setUpdating]=useState(false);
  const [clickSource,setClickSource]=useState("");
  const [action, setAction]=useState("Add To Task");
  const [idToUp, setIdToUp]=useState("");

  const handleClick=(task,id1,source)=>{
    setIdToUp(id1);
    setUpdating(true);
    setTodo(task);
    setClickSource(source);
    setAction("Update");
  }
  const clickOutSpace=()=>{
    setIdToUp();
    setUpdating(false);
    setTodo("");
    setClickSource(null);
    setAction("Add To Task");

  }
  const dragRef = useRef({});

  const addToPlan = async (task, destination) => {
    const docRef = push(ref(db, "plan/" + destination));
    set(docRef, { name: task });
  };

  useEffect(() => {
    realTimeGetData();

  }, []);

  const handleDragStart = (sta, item, id, index) => {
    setIsDragging(true);
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

  const realTimeGetData=()=>{
    
    const dbReftodo = ref(db, "plan/todo");
    onValue(dbReftodo,snapshot=>{
      const data=snapshot.val();
      if(data)
      {
        const temp=Object.keys(data).map(id=>({
          ...data[id],planId:id,
        }));

        const sortedTemp=temp.sort((a,b)=>{
          return a.name.localeCompare(b.name);
        })
        setTodolist(sortedTemp);
      }
      else
      {
        setTodolist([]);
      }
    });

    const dbRefpro = ref(db, "plan/progress");
    onValue(dbRefpro,snapshot=>{
      const data=snapshot.val();
      if(data)
      {
        const temp=Object.keys(data).map(id=>({
          ...data[id],planId:id,
        }));
        const sortedTemp=temp.sort((a,b)=>{
          return a.name.localeCompare(b.name);
        })
        setProlist(sortedTemp);
      }
      else
      {
        setProlist([]);
      }
    });
    const dbRefcom = ref(db, "plan/completed");
    onValue(dbRefcom,snapshot=>{
      const data=snapshot.val();
      if(data)
      {
        const temp=Object.keys(data).map(id=>({
          ...data[id],planId:id,
        }));
        const sortedTemp=temp.sort((a,b)=>{
          return a.name.localeCompare(b.name);
        })
        setComlist(sortedTemp);
      }
      else
      {
        setComlist([]);
      }
    });
  }

  const addToDo = async (event) => {
    event.preventDefault();
    if (todo.trim() === '') {
      alert("Task cannot be empty");
      return;
    }
    else if(update)
    { 
        const updRef=ref(db,"plan/"+clickSource+"/"+idToUp);
        const snapshot=await get(updRef);
        if(snapshot.exists())
        {
            set(updRef,{name:todo})
            .then(()=>{
              alert("Data Changed Successfully");
            })
            .catch((error)=>{
              alert("Error : "+error.message)
            })
        }
        else
        {
          alert("no such an item!");
        }  
    }
    else
    {
      const newDocref = push(ref(db, "plan/todo"));
      set(newDocref, { name: todo })
      .then(() => {
        alert("Data Saved Successfully");
        setTodo('');
      })
      .catch((error) => {
        alert("Error : " + error.message);
      });
    }
  };
  const deletePlan = async (source, id) => {
    setUpdating(false);
    setTodo("");
    setAction("Add To Task")
    const dbref = ref(db, "plan/" + source + "/" + id);
    await remove(dbref);
  };

  return (
    <div className="p-10 flex flex-col h-screen text-lg items-center bg-slate-300" >
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
          value={action}
          className="bg-blue-500 px-4 py-2 sm:ms-1 rounded-sm border-1 border-blue-500 sm:mt-0 mt-2"
        />
        {update?<div>
          <button
          className="bg-blue-500 px-4 py-2 sm:ms-1 rounded-sm border-1 border-blue-500 sm:mt-0 mt-2 h-full"
          onClick={clickOutSpace}>
          Cancel</button>
          <button
          className="bg-blue-500 px-4 py-2 sm:ms-1 rounded-sm border-1 border-blue-500 sm:mt-0 mt-2 h-full"
          onClick={()=>deletePlan(clickSource,idToUp)}>
            Delete
          </button>
        </div>:""}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:gap-10 md:gap-2 gap-0">
        <div className="mt-10">
          <div className="text-center bg-orange-300 py-2">To Do List</div>
          <section className="w-56 h-80 border-2 px-2 py-1 overflow-auto" onDragEnter={() => setStatus1("todo")} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {todolist.map((item, index) => (
              <div key={index}>
                <div draggable onDragStart={() => handleDragStart("todo", item.name, item.planId, index)} 
                onClick={()=>handleClick(item.name,item.planId,"todo")}
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
                onClick={()=>handleClick(item.name,item.planId,"progress")} 
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
                onClick={()=>handleClick(item.name,item.planId,"completed")}
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

