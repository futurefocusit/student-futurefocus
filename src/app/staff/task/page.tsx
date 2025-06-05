"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import { Send, Message, Check, AccessTime, Schedule, Close } from "@mui/icons-material";
import API_BASE_URL from "@/config/baseURL";
import withMemberAuth from "@/components/withMemberAuth";
import { useAuth } from "@/context/AuthContext";
import SideBar from "@/components/SideBar";
import { toast } from "react-toastify";
import Loader from "@/components/loader";

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  user: { name: string; _id: string, image: string };
  replies?: Comment[];
}

interface Task {
  _id: string;
  status: string;
  task: string;
  manager: { name: string; _id: string; role: string };
  startTime: string;
  endTime: string;
  comments: Comment[];
}

const MemberTasks: React.FC = () => {
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comment, setComment] = useState<string>("");
  const [reply, setReply] = useState<{
    commentId: string;
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"pending" | "started" | "completed">("pending");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      await fetchLoggedUser();
      const res = await axios.get<Task[]>(
        `${API_BASE_URL}/task/${loggedUser?._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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

  const handleAddComment = async (taskId: string) => {
    if (!comment.trim()) {
      toast.warning("Please enter a comment");
      return;
    }
    try {
      // setLoading(true);
      await axios.post(
        `${API_BASE_URL}/task/comment/${taskId}`,
        {
          text: comment,
          user: loggedUser?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );
      setComment("");
      await fetchTasks();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!reply?.text.trim()) {
      toast.warning("Please enter a reply");
      return;
    }
    try {
      // setLoading(true);
      await axios.post(
        `${API_BASE_URL}/task/comment/reply/${commentId}`,
        {
          text: reply.text,
          user: loggedUser?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );
      setReply(null);
      await fetchTasks();
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsStarted = async (taskId: string) => {
    try {
      // setLoading(true);
      await axios.put(
        `${API_BASE_URL}/task/${taskId}`,
        { status: "started" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );
      await fetchTasks();
      toast.success("Task marked as started");
    } catch (error) {
      console.error("Error marking task as started:", error);
      toast.error("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <SideBar />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="font-bold text-gray-800 ml-20">
           MY TASKS
          </Typography>
          <div className="flex gap-2">
            {[ "pending", "started", "completed"].map((status) => (
              <Chip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)+"("+ tasks.filter(t=>t.status===status).length +")"}
                onClick={() => setFilter(status as "pending" | "started" | "completed")}
                color={filter === status ? "primary" : "default"}
                className={`cursor-pointer ${filter === status
                  ? "bg-[#4a90e2] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </div>

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
                    <div className="space-y-2 max-h-28 overflow-y-scroll">
                      {t.task.split(",").map((task, index) => (
                        <Typography key={index} className="font-medium">
                          {index + 1}. {task}
                        </Typography>
                      ))}
                    </div>
                  }
                  subheader={
                    <div className="flex items-center justify-between mt-2 ">
                      <Chip
                        label={t.status}
                        size="small"
                        style={{ backgroundColor: statusColor(t.status) }}
                        className="text-white"
                      />
                      <Typography variant="caption" className="text-gray-500">
                        Assigned by: {t.manager?.name}
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
                    <Tooltip title="Mark as Started">
                      <IconButton
                        onClick={() => handleMarkAsStarted(t._id)}
                        color="success"
                        disabled={t.status === "started" || t.status === "completed"}
                      >
                        <Check />
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
                      <div className="flex items-start gap-2">
                        <Avatar className="bg-[#4a90e2]">
                          {comment.user?.image ? <img src={comment.user.image} alt={comment.user.name} className="w-6 h-6 rounded-full" /> : comment.user?.name.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                          <Typography variant="subtitle2" className="font-medium">
                            {comment.user?.name}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </div>
                      </div>

                      {comment.replies?.map((replyComment) => (
                        <div
                          key={replyComment._id}
                          className="ml-8 mt-2 bg-white p-3 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <Avatar className="bg-[#f5a623]" style={{ width: 24, height: 24 }}>
                              {replyComment.user?.image ? <img src={replyComment.user.image} alt={replyComment.user.name} className="w-6 h-6 rounded-full" /> : replyComment.user?.name.charAt(0)}
                            </Avatar>
                            <div className="flex-1">
                              <Typography variant="subtitle2" className="font-medium">
                                {replyComment.user?.name}
                              </Typography>
                              <Typography variant="body2" className="text-gray-600">
                                {replyComment.text}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {new Date(replyComment.createdAt).toLocaleString()}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      ))}

                      {reply?.commentId === comment._id ? (
                        <div className="mt-2">
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Write a reply..."
                            value={reply.text}
                            onChange={(e) => setReply({ ...reply, text: e.target.value })}
                            className="mb-2"
                          />
                          <div className="flex justify-end">
                            <Button
                              variant="contained"
                              onClick={() => handleAddReply(comment._id)}
                              disabled={loading}
                              startIcon={<Send />}
                              className="bg-[#f5a623] hover:bg-[#e0961a]"
                            >
                              {loading ? "Sending..." : "Send Reply"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="text"
                          onClick={() => setReply({ commentId: comment._id, text: "" })}
                          className="mt-2"
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

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
      </div>
    </>
  );
};

export default withMemberAuth(MemberTasks);
