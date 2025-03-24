import React from "react";

const Message = ({ sender, text }) => {
  return (
    <div className={`message ${sender === "User" ? "user" : "ai"}`}>
      <strong>{sender}: </strong> {text}
    </div>
  );
};

export default Message;
