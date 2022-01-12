const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
app.use(express.json());
const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initialiseDbAndServer();

//GET all TODOs
app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;
  if (status === "TO DO") {
    const getTodoArray = `SELECT * FROM todo WHERE status = '${status}' AND todo LIKE '%${search_q}%';`;
    const todoArray = await db.all(getTodoArray);
    response.send(todoArray);
  } else if (priority === "HIGH") {
    const getTodoArray = `SELECT * FROM todo WHERE priority = '${priority}' AND todo LIKE '%${search_q}%';`;
    const todoArray = await db.all(getTodoArray);
    response.send(todoArray);
  } else if (priority === "HIGH" && status === "IN PROGRESS") {
    const getTodoArray = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}' AND todo LIKE '%${search_q}%';`;
    const todoArray = await db.all(getTodoArray);
    response.send(todoArray);
  } else if (search_q === "Play") {
    const getTodoArray = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const todoArray = await db.all(getTodoArray);
    response.send(todoArray);
  }
});

//GET specified TODO
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todoArray = await db.get(getTodoQuery);
  response.send(todoArray);
});
//POST TODO API
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `INSERT INTO todo (id,todo,priority,status)
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  let updateColumn = "";
  if (todoDetails.status !== undefined) {
    updateColumn = "Status";
  } else if (todoDetails.priority !== undefined) {
    updateColumn = "Priority";
  } else {
    updateColumn = "Todo";
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoQuery = `UPDATE todo 
    SET 
       todo= '${todo}',
       priority = '${priority}',
       status = '${status}'
    WHERE id = ${todoId};`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//DELETE TODO API
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
