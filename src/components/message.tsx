import React from "react";

interface MessageProps {
  type: string;
  text: string;
}

const Message: React.FC<MessageProps> = ({ type, text }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return <div className={`p-4 mb-4 ${bgColor} border rounded`}>{text}</div>;
};

export default Message;
