"use client";

import { useState, Dispatch, SetStateAction } from "react";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const CHAT_WIDTH = 340;

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

type ChatBotProps = {
  chatOpen: boolean;
  setChatOpen: Dispatch<SetStateAction<boolean>>;
  topOffset?: number;
};

export default function ChatBot({
  chatOpen,
  setChatOpen,
  topOffset = 0,
}: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const closeChat = () => setChatOpen(false);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: chatInput }]);
    setChatInput("");
    // TODO: wire this up to your actual chatbot endpoint
  };

  return (
    <Drawer
      anchor="right"
      open={chatOpen}
      onClose={closeChat}
      sx={{
        "& .MuiDrawer-paper": {
          width: CHAT_WIDTH,
          maxWidth: "90vw",
          boxSizing: "border-box",
          top: topOffset,
          height: `calc(100% - ${topOffset}px)`,
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Assistant
          </Typography>
          <IconButton size="small" onClick={closeChat}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Ask me anything about the data on this page.
            </Typography>
          )}
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                bgcolor:
                  msg.role === "user" ? "primary.main" : "action.hover",
                color:
                  msg.role === "user"
                    ? "primary.contrastText"
                    : "text.primary",
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                maxWidth: "85%",
                fontSize: 14,
              }}
            >
              {msg.text}
            </Box>
          ))}
        </Box>

        <Divider />

        <Box sx={{ p: 1.5, display: "flex", gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}