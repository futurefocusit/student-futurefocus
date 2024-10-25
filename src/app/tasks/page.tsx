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
} from "@mui/material";
import { Send, Message, Check, Delete } from "@mui/icons-material";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import withAdminAuth from "@/components/withAdminAuth";
import SideBar from "@/components/SideBar";

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
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [task, setTask] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comment, setComment] = useState<string>("");
  const [reply, setReply] = useState<{
    commentId: string;
    text: string;
  } | null>(null);
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
        return "#153cec";
      case "completed":
        return "#36c622";

      default:
        return "#272033";
    }
  };
  const fetchTasks = async () => {
    try {
      const res = await axios.get<Task[]>(`${API_BASE_URL}/task`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>(`${API_BASE_URL}/member`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/task`, {
        task,
        user,
        manager: loggedUser?._id,

        endTime,
        startTime,
      });
      setIsFormOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  const resetForm = () => {
    setTask("");
    setUser("");
    setEndTime("");
    setStartTime("");
  };

  const handleMarkAsDone = async (taskId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/task/${taskId}`, {
        status: "completed",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/task/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleAddComment = async (taskId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/task/comment/${taskId}`, {
        text: comment,
        user: loggedUser?._id,
      });
      setComment("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!reply) return;
    try {
      await axios.post(`${API_BASE_URL}/task/comment/reply/${commentId}`, {
        text: reply.text,
        user: loggedUser?._id,
      });
      setReply(null);
      fetchTasks();
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  return (
    <>
      <SideBar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        <Typography variant="h4" gutterBottom>
          Admin Task Assignment
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
          }}
        >
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                autoFocus
                margin="dense"
                label="Task description"
                fullWidth
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
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
              />
              <TextField
                margin="dense"
                label="End Time"
                type="datetime-local"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
              <DialogActions>
                <Button onClick={() => setIsFormOpen(false)} color="primary">
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Assign Task
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
          {tasks.map((t) => (
            <Card key={t._id}>
              <CardHeader
                title={t.task}
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
                  onClick={() => handleDeleteTask(t._id)}
                  style={{ marginLeft: "8px" }}
                >
                  <Delete style={{ marginRight: "8px" }} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedTask && (
          <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)}>
            <DialogTitle>{selectedTask.task}</DialogTitle>
            <DialogContent>
              <div style={{ marginBottom: "16px" }}>
                {selectedTask.comments?.map((comment) => (
                  <div key={comment._id} style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        background: "#f5f5f5",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      <Typography variant="body1">
                        {comment?.user?.name}: {comment?.text}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setReply({ commentId: comment._id, text: "" })
                        }
                      >
                        Reply
                      </Button>
                      {comment.replies?.map((replyComment) => (
                        <div
                          key={replyComment._id}
                          style={{ marginLeft: "20px", marginTop: "8px" }}
                        >
                          <Typography
                            variant="body2"
                            style={{
                              background: "#e0e0e0",
                              padding: "4px",
                              borderRadius: "4px",
                            }}
                          >
                            {replyComment?.user?.name}: {replyComment?.text}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {reply && (
                <div>
                  <TextField
                    placeholder="Add a reply..."
                    fullWidth
                    value={reply.text}
                    onChange={(e) =>
                      setReply({ ...reply, text: e.target.value })
                    }
                  />
                  <IconButton
                    onClick={() => handleAddReply(reply.commentId)}
                    color="primary"
                  >
                    <Send />
                  </IconButton>
                </div>
              )}
              <TextField
                placeholder="Add a comment..."
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <IconButton
                onClick={() => handleAddComment(selectedTask._id)}
                color="primary"
              >
                <Send />
              </IconButton>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default withAdminAuth(MemberTasks);
