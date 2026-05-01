import { handleHealth } from "./handlers/health.js";
import { listTasks, getTask, createTask, updateTask, deleteTask } from "./handlers/tasks.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

function withCors(response) {
  return { ...response, headers: { ...CORS, ...(response.headers || {}) } };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path = event.requestContext?.http?.path || event.path || "/";

  if (method === "OPTIONS") return withCors({ statusCode: 204, body: "" });

  try {
    const taskIdMatch = path.match(/^\/tasks\/([^/]+)$/);
    const taskId = taskIdMatch?.[1];
    const body = event.body ? JSON.parse(event.body) : {};

    let response;

    if (path === "/health" && method === "GET") {
      response = handleHealth();
    } else if (path === "/tasks" && method === "GET") {
      response = await listTasks();
    } else if (path === "/tasks" && method === "POST") {
      response = await createTask(body);
    } else if (taskId && method === "GET") {
      response = await getTask(taskId);
    } else if (taskId && method === "PUT") {
      response = await updateTask(taskId, body);
    } else if (taskId && method === "DELETE") {
      response = await deleteTask(taskId);
    } else {
      response = { statusCode: 404, body: JSON.stringify({ success: false, data: null, error: "Route not found" }) };
    }

    return withCors(response);
  } catch (err) {
    const isNotFound = err.name === "ConditionalCheckFailedException";
    return withCors({
      statusCode: isNotFound ? 404 : 500,
      body: JSON.stringify({ success: false, data: null, error: isNotFound ? "Task not found" : err.message }),
    });
  }
};
