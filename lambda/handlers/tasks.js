import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMODB_TABLE;

function ok(data) {
  return { statusCode: 200, body: JSON.stringify({ success: true, data, error: null }) };
}

function fail(statusCode, message) {
  return { statusCode, body: JSON.stringify({ success: false, data: null, error: message }) };
}

export async function listTasks() {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
  const items = (result.Items || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok(items);
}

export async function getTask(id) {
  const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
  if (!result.Item) return fail(404, "Task not found");
  return ok(result.Item);
}

export async function createTask(body) {
  const { title, description = "", status = "pending", priority = "medium", dueDate = null } = body;
  if (!title || title.trim() === "") return fail(400, "title is required");

  const now = new Date().toISOString();
  const item = { id: uuidv4(), title: title.trim(), description, status, priority, dueDate, createdAt: now, updatedAt: now };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return { statusCode: 201, body: JSON.stringify({ success: true, data: item, error: null }) };
}

export async function updateTask(id, body) {
  const allowed = ["title", "description", "status", "priority", "dueDate"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
  if (Object.keys(updates).length === 0) return fail(400, "No valid fields to update");

  updates.updatedAt = new Date().toISOString();

  const expr = "SET " + Object.keys(updates).map((k, i) => `#f${i} = :v${i}`).join(", ");
  const names = Object.fromEntries(Object.keys(updates).map((k, i) => [`#f${i}`, k]));
  const values = Object.fromEntries(Object.keys(updates).map((k, i) => [`:v${i}`, updates[k]]));

  const result = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { id },
    UpdateExpression: expr,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
  }));
  return ok(result.Attributes);
}

export async function deleteTask(id) {
  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
  }));
  return ok({ id, deleted: true });
}
