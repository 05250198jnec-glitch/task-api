const Task = require("../models/taskModel");

const validStatuses = ["pending", "in_progress", "completed"];

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

exports.getTasks = async (req, res, next) => {
  try {
    const { search = "", status = "" } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const tasks = await Task.getAll({
      search: String(search).trim(),
      status,
      limit,
      offset: (page - 1) * limit
    });

    res.status(200).json({
      success: true,
      page,
      limit,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid task ID" });

    const task = await Task.getById(id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description = "", status = "pending" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (title.trim().length > 150) {
      return res.status(400).json({ success: false, message: "Title must be 150 characters or fewer" });
    }
    if (typeof description !== "string") {
      return res.status(400).json({ success: false, message: "Description must be text" });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const task = await Task.create({ title: title.trim(), description: description.trim(), status });
    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid task ID" });

    const existing = await Task.getById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Task not found" });

    const { title, description, status } = req.body;
    if (title !== undefined && (typeof title !== "string" || !title.trim() || title.trim().length > 150)) {
      return res.status(400).json({ success: false, message: "Title must be non-empty and 150 characters or fewer" });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ success: false, message: "Description must be text" });
    }
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const task = await Task.update(id, {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(status !== undefined ? { status } : {})
    });

    res.status(200).json({ success: true, message: "Task updated successfully", data: task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid task ID" });

    const deleted = await Task.remove(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
