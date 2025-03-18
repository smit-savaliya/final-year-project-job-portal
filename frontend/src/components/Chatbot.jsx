import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I’m your Job Portal assistant. How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const backendurl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    const userMessage = input;
    setInput("");

    try {
      const response = await axios.post(
        `${backendurl}/api/chatbot/message`,
        { message: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        setMessages((prev) => [...prev, { text: response.data.response, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Error occurred.", sender: "bot" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Failed to connect.", sender: "bot" }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          Chat
        </button>
      )}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between">
            <h3>Job Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white">
              X
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs p-2 rounded-lg ${
                    msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-lg focus:outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-r-lg">
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;