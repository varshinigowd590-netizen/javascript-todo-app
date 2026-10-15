const STORAGE_KEY = "todos";
let todos = loadTodos();
let currentFilter = "all";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const filters = document.getElementById("filters");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear-completed");

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// CREATE
function addTodo(text) {
  todos.push({ id: Date.now(), text, completed: false });
  update();
}

// UPDATE
function toggleTodo(id) {
  const t = todos.find(t => t.id === id);
  if (t) t.completed = !t.completed;
  update();
}

function editTodo(id, text) {
  const t = todos.find(t => t.id === id);
  if (t && text.trim()) t.text = text.trim();
  update();
}

// DELETE
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  update();
}

function update() {
  saveTodos();
  render();
}

// READ / render
function render() {
  list.innerHTML = "";
  const visible = todos.filter(t =>
    currentFilter === "all" ? true :
    currentFilter === "active" ? !t.completed : t.completed
  );

  visible.forEach(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    if (t.completed) li.classList.add("completed");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.completed;
    cb.className = "toggle";

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = t.text;

    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "Edit";

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";

    li.append(cb, span, edit, del);
    list.appendChild(li);
  });

  const left = todos.filter(t => !t.completed).length;
  count.textContent = `${left} task${left === 1 ? "" : "s"} left`;

  filters.querySelectorAll("button").forEach(b =>
    b.classList.toggle("active", b.dataset.filter === currentFilter)
  );
}

// Events
form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
});

// Event delegation: one listener on the <ul>
list.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains("delete")) {
    deleteTodo(id);
  } else if (e.target.classList.contains("toggle")) {
    toggleTodo(id);
  } else if (e.target.classList.contains("edit")) {
    const span = li.querySelector(".text");
    const field = document.createElement("input");
    field.className = "edit-input";
    field.value = span.textContent;
    span.replaceWith(field);
    field.focus();
    e.target.textContent = "Save";
    e.target.classList.replace("edit", "save");
  } else if (e.target.classList.contains("save")) {
    editTodo(id, li.querySelector(".edit-input").value);
  }
});

list.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.classList.contains("edit-input")) {
    editTodo(Number(e.target.closest("li").dataset.id), e.target.value);
  }
});

filters.addEventListener("click", e => {
  if (e.target.dataset.filter) {
    currentFilter = e.target.dataset.filter;
    render();
  }
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  update();
});

render();
