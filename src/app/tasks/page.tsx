"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Send,
  Message,
  Check,
  Delete,
  Edit,
  Add,
  Close,
  Reply,
  AccessTime,
  Schedule,
} from "@mui/icons-material";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import withAdminAuth from "@/components/withAdminAuth";
import SideBar from "@/components/SideBar";
import ConfirmDeleteModal from "@/components/confirmPopupmodel";
import Head from "next/head";
import { toast } from "react-toastify";

// Types
interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: { name: string; _id: string,image:string };
  replies?: Comment[];
}

interface Task {
  _id: string;
  task: string;
  user: { name: string; _id: string; role: string };
  startTime: string;
  endTime: string;
  status: string;
  comments: Comment[];
}

interface User {
  _id: string;
  name: string;
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [confirmModelOpen, SetConfirmModel] = useState(false);
  const [action, setAction] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [task, setTask] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comment, setComment] = useState<string>("");
  const [loading, setIsLoading] = useState(false);
  const [reply, setReply] = useState<{
    commentId: string;
    text: string;
  } | null>(null);
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchloggedUser = async () => {
      await fetchLoggedUser();
    };
    fetchloggedUser();
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "started":
        return "#4a90e2"; // Light blue
      case "completed":
        return "#f5a623"; // Light orange
      default:
        return "#7ed321"; // Light green for pending
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get<Task[]>(`${API_BASE_URL}/task`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>(`${API_BASE_URL}/member`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    SetConfirmModel(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/task`, {
        task,
        user,
        manager: loggedUser?._id,
        endTime,
        startTime,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setIsFormOpen(false);
      resetForm();
      fetchTasks();
      toast.success("Task assigned successfully");
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("Failed to assign task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForUpdate) return;

    try {
      setIsLoading(true);
      await axios.patch(`${API_BASE_URL}/task/${selectedTaskForUpdate._id}`, {
        task,
        user,
        startTime,
        endTime,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setIsFormOpen(false);
      resetForm();
      setSelectedTaskForUpdate(null);
      fetchTasks();
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTask("");
    setUser("");
    setEndTime("");
    setStartTime("");
    setSelectedTaskForUpdate(null);
  };

  const handleMarkAsDone = async (taskId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/task/${taskId}`, {
        status: "completed",
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        }
      });
      fetchTasks();
      toast.success("Task marked as completed");
    } catch (error) {
      console.error("Error marking task as done:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        }
      });
      fetchTasks();
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsLoading(false);
      SetConfirmModel(false);
    }
  };

  const handleAddComment = async (taskId: string) => {
    if (!comment.trim()) {
      toast.warning("Please enter a comment");
      return;
    }
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/task/comment/${taskId}`, {
        text: comment,
        user: loggedUser?._id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setComment("");
      fetchTasks();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!reply?.text.trim()) {
      toast.warning("Please enter a reply");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/task/comment/reply/${commentId}`, {
        text: reply.text,
        user: loggedUser?._id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setReply(null);
      fetchTasks();
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <>
      <Head>
        <title>Task Management</title>
        <meta name="description" content="Manage Tasks For your Team" />
        <meta property="og:title" content="Task Management" />
        <meta property="og:description" content="Manage Tasks For your Team" />
        <meta property="og:image" content="/xcooll.png" />
      </Head>
      <SideBar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="font-bold text-gray-800">
            Task Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setIsFormOpen(true);
              resetForm();
            }}
            className="bg-[#4a90e2] hover:bg-[#357abd]"
          >
            New Task
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {["all", "pending", "started", "completed"].map((status) => (
            <Chip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => setFilter(status)}
              color={filter === status ? "primary" : "default"}
              className={`cursor-pointer ${filter === status
                ? "bg-[#4a90e2] text-white"
                : "bg-gray-100 hover:bg-gray-200"
                }`}
            />
          ))}
        </div>

        <Dialog
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="bg-gray-50">
            {selectedTaskForUpdate ? "Update Task" : "Create New Task"}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={selectedTaskForUpdate ? handleUpdateTask : handleSubmit} className="mt-4">
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  Task Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter task details (separate multiple tasks with commas)"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="mb-4"
                />
              </Box>

              <FormControl fullWidth className="mb-4">
                <InputLabel>Assign to</InputLabel>
                <Select
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Start Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </div>

              <DialogActions>
                <Button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  className="bg-[#4a90e2] hover:bg-[#357abd]"
                >
                  {loading ? "Processing..." : selectedTaskForUpdate ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Typography variant="h6" color="textSecondary">
                No tasks available
              </Typography>
            </div>
          ) : (
            filteredTasks.map((t) => (
              <Card key={t._id} className="hover:shadow-lg transition-shadow border border-gray-100">
                <CardHeader
                  className="bg-gradient-to-r from-[#4a90e2]/5 to-[#f5a623]/5"
                  title={
                    <div className="space-y-2">
                      {t.task.split(",").map((task, index) => (
                        <Typography key={index} className="font-medium">
                          {index + 1}. {task}
                        </Typography>
                      ))}
                    </div>
                  }
                  subheader={
                    <div className="flex items-center justify-between mt-2">
                      <Chip
                        label={t.status}
                        size="small"
                        style={{ backgroundColor: statusColor(t.status) }}
                        className="text-white"
                      />
                      <Typography variant="caption" className="text-gray-500">
                        Assigned to: {t.user?.name}
                      </Typography>
                    </div>
                  }
                />
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <AccessTime className="text-gray-500" />
                    <Typography variant="body2" color="textSecondary">
                      Start: {new Date(t.startTime).toLocaleString()}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Schedule className="text-gray-500" />
                    <Typography variant="body2" color="textSecondary">
                      End: {new Date(t.endTime).toLocaleString()}
                    </Typography>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip title="Comments">
                      <IconButton onClick={() => setSelectedTask(t)} color="primary">
                        <Badge badgeContent={t.comments?.length || 0} color="primary">
                          <Message />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark as Complete">
                      <IconButton
                        onClick={() => handleMarkAsDone(t._id)}
                        color="success"
                        disabled={t.status === "completed"}
                      >
                        <Check />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Task">
                      <IconButton
                        onClick={() => {
                          setSelectedTaskForUpdate(t);
                          setTask(t.task);
                          setUser(t.user._id);
                          setStartTime(t.startTime);
                          setEndTime(t.endTime);
                          setIsFormOpen(true);
                        }}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Task">
                      <IconButton
                        onClick={() => {
                          handleDeleteClick(t._id);
                          setAction("delete task");
                        }}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedTask && (
          <Dialog
            open={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle className="bg-gray-50 flex justify-between items-center">
              <Typography variant="h6">Task Details</Typography>
              <IconButton onClick={() => setSelectedTask(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent className="mt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Task Description
                  </Typography>
                  {selectedTask.task.split(",").map((task, index) => (
                    <Typography key={index} className="mb-2">
                      {index + 1}. {task}
                    </Typography>
                  ))}
                </div>

                <div className="space-y-4">
                  <Typography variant="subtitle1" className="font-semibold">
                    Comments
                  </Typography>
                  {selectedTask.comments?.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="bg-[#4a90e2]">
                           {comment.user.image ? <img src={comment.user.image} alt={comment.user.name} className="w-6 h-6 rounded-full" /> : comment.user?.name.charAt(0)}
                        </Avatar>
                        <div>
                          <Typography variant="subtitle2" className="font-semibold">
                            {comment.user?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </div>
                      </div>
                      <Typography variant="body1" className="ml-12">
                        {comment.text}
                      </Typography>
                      <div className="ml-12 mt-2">
                        <Button
                          startIcon={<Reply />}
                          size="small"
                          onClick={() => setReply({ commentId: comment._id, text: "" })}
                        >
                          Reply
                        </Button>
                      </div>
                      {comment.replies?.map((reply) => (
                        <div key={reply._id} className="ml-12 mt-2 bg-gray-100 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="bg-[#f5a623]" style={{ width: 24, height: 24 }}>
                                {reply.user.image ? <img src={reply.user.image} alt={reply.user.name} className="w-6 h-6 rounded-full" /> : reply.user?.name.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2" className="font-semibold">
                              {reply.user?.name}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="ml-8">
                            {reply.text}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {reply && (
                  <div className="mt-4">
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Write a reply..."
                      value={reply.text}
                      onChange={(e) => setReply({ ...reply, text: e.target.value })}
                      className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outlined"
                        onClick={() => setReply(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleAddReply(reply.commentId)}
                        disabled={loading}
                        className="bg-[#f5a623] hover:bg-[#e0961a]"
                      >
                        {loading ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="contained"
                      onClick={() => handleAddComment(selectedTask._id)}
                      disabled={loading}
                      startIcon={<Send />}
                      className="bg-[#4a90e2] hover:bg-[#357abd]"
                    >
                      {loading ? "Sending..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {confirmModelOpen && (
          <ConfirmDeleteModal
            onClose={() => SetConfirmModel(false)}
            onConfirm={() => handleDeleteTask(itemToDelete!)}
            action={action}
            loading={loading}
          />
        )}
      </div>
    </>
  );
};

export default withAdminAuth(TaskManagement);
