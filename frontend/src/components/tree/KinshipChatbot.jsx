import React, { useState } from "react";
import PropTypes from "prop-types";
import kinshipService from "../../services/kinshipService";

const KinshipChatbot = ({ persons }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your kinship assistant. Ask me about relationships in your family tree. For example: 'What is John's relationship to Emma?'",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    // Add user message to chat
    const userMessage = { type: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setQuestion("");

    // Show loading state
    setLoading(true);

    try {
      // Get response from AI
      const response = await kinshipService.askKinshipQuestion(question);

      // Add bot message to chat
      const botMessage = { type: "bot", text: response.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error asking question:", error);

      // Add error message to chat
      const errorMessage = {
        type: "bot",
        text: "Sorry, I couldn't process your question. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Kinship Chatbot</h2>

      <div className="h-64 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-md">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              message.type === "user"
                ? "bg-indigo-100 ml-8"
                : "bg-gray-100 mr-8"
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about family relationships..."
          className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          className={`py-2 px-4 rounded-r-md ${
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>

      <div className="mt-3 text-xs text-gray-500">
        <p>
          Tip: Try asking questions like "Who is [person]'s grandfather?" or
          "What is the relationship between [person] and [person]?"
        </p>
      </div>
    </div>
  );
};

KinshipChatbot.propTypes = {
  persons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default KinshipChatbot;
