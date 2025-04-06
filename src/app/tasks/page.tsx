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
} from "@mui/material";
import {
  Send,
  Message,
  Check,
  Delete,
} from "@mui/icons-material";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import withAdminAuth from "@/components/withAdminAuth";
import SideBar from "@/components/SideBar";
import ConfirmDeleteModal from "@/components/confirmPopupmodel";

// Types
interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: { name: string; _id: string };
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

const MemberTasks: React.FC = () => {
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
        return "#85aae6";
      case "completed":
        return "#85e6c2";
      default:
        return "#e685df";
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get<Task[]>(`${API_BASE_URL}/task`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>(`${API_BASE_URL}/member`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId); // Set the item that will be deleted
    SetConfirmModel(true); // Open the modal
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
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setIsFormOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
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
      setSelectedTaskForUpdate(null); // Reset selected task after update
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTask("");
    setUser("");
    setEndTime("");
    setStartTime("");
    setSelectedTaskForUpdate(null); // Reset task being edited
  };

  const handleMarkAsDone = async (taskId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/task/${taskId}`, {
        status: "completed",
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        }
      });
      fetchTasks();
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/task/${taskId}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        }
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
      SetConfirmModel(false);
    }
  };

  const handleAddComment = async (taskId: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/task/comment/${taskId}`, {
        text: comment,
        user: loggedUser?._id,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setComment("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsFormOpen(false);
      setIsLoading(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!reply) return;
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/task/comment/reply/${commentId}`, {
        text: reply.text,
        user: loggedUser?._id,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setReply(null);
      fetchTasks();
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsFormOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <SideBar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        <Typography variant="h4" gutterBottom>
          ADMIN TASK ASSIGNMENT
        </Typography>

        <Button
          variant="contained"
          onClick={() => {
            setIsFormOpen(true);
            resetForm();
          }}
          style={{ marginBottom: "16px" }}
        >
          Assign New Task
        </Button>

        <Dialog
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            resetForm();
            setSelectedTaskForUpdate(null); // Reset task when closing
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedTaskForUpdate ? "Update Task" : "Assign New Task"}</DialogTitle>
          <DialogContent>
            <form onSubmit={selectedTaskForUpdate ? handleUpdateTask : handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Task Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  placeholder="Enter task separated by comma(',')"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
              </Box>

              <FormControl fullWidth margin="dense">
                <InputLabel id="user-select-label">Assign to User</InputLabel>
                <Select
                  labelId="user-select-label"
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

              <TextField
                margin="dense"
                label="Start Time"
                type="datetime-local"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                margin="dense"
                label="End Time"
                type="datetime-local"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />

              <DialogActions>
                <Button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                    setSelectedTaskForUpdate(null); // Reset task when closing
                  }}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  {selectedTaskForUpdate ? "Update Task" : "Assign Task"}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {tasks.length === 0 ? (
            <p>No tasks available</p>
          ) : (
            tasks.map((t) => (
              <Card key={t._id}>
                <CardHeader
                  title={
                    <div>
                      {t.task.split(",").map((task, index) => (
                        <p className="font-bold" key={index}>
                          {index + 1}
                          {". "}
                          {task}
                        </p>
                      ))}
                    </div>
                  }
                  subheader={`Assigned to: ${t.user?.name} | Status: ${t.status}`}
                  style={{
                    backgroundColor: statusColor(t.status),
                  }}
                />
                <CardContent>
                  <Typography variant="body2">
                    Start: {new Date(t.startTime).toLocaleString()} <br />
                    End: {new Date(t.endTime).toLocaleString()}
                  </Typography>
                  <Button variant="outlined" onClick={() => setSelectedTask(t)}>
                    <Message style={{ marginRight: "2px" }} />
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleMarkAsDone(t._id)}
                    style={{ marginLeft: "8px" }}
                  >
                    <Check style={{ marginRight: "8px" }} />
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => { handleDeleteClick(t._id); setAction("delete task"); }}
                    style={{ marginLeft: "8px" }}
                  >
                    <Delete style={{ marginRight: "8px" }} />
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setSelectedTaskForUpdate(t);
                      setTask(t.task);
                      setUser(t.user._id);
                      setStartTime(t.startTime);
                      setEndTime(t.endTime);
                      setIsFormOpen(true);
                    }}
                    style={{ marginLeft: "8px" }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedTask && (
          <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)}>
            <div>
              {selectedTask.task.split(",").map((task, index) => (
                <p className="font-bold" key={index}>
                  {index + 1}
                  {". "}
                  {task}
                </p>
              ))}
            </div>

            <DialogContent>
              <div style={{ marginBottom: "16px" }}>
                {selectedTask.comments?.map((comment) => (
                  <div key={comment._id}>
                    <p>
                      <b>{comment.user?.name}:</b> {comment.text}
                    </p>
                    {comment.replies?.map((reply) => (
                      <p key={reply._id} style={{ paddingLeft: "20px" }}>
                        <b>{reply.user?.name}:</b> {reply.text}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <TextField
                fullWidth
                label="Add a Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ marginBottom: "16px" }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddComment(selectedTask._id)}
              >
                Add Comment
              </Button>

              {reply && (
                <div>
                  <TextField
                    fullWidth
                    label="Reply"
                    value={reply.text}
                    onChange={(e) =>
                      setReply({ ...reply, text: e.target.value })
                    }
                    style={{ marginBottom: "16px" }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddReply(reply.commentId)}
                  >
                    Add Reply
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

   {
    confirmModelOpen&& <ConfirmDeleteModal
    onClose={() => SetConfirmModel(false)}
    onConfirm={() => handleDeleteTask(itemToDelete!)} action={'delete'} loading={false}/>
   }
    </>
  );
};

export default withAdminAuth(MemberTasks);
