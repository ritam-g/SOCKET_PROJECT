import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { connectWS } from "./ws.js";

export default function App() {
  const [userName, setUserName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [inputName, setInputName] = useState("");

  const socket = useRef(null)

  const timer = useRef(null)
  const userNameRef = useRef("");
  const stopTypingRef = useRef(() => {});

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [typers, setTypers] = useState([]); // dummy for UI only

  userNameRef.current = userName;
  stopTypingRef.current = () => {
    const currentUserName = userNameRef.current;
    if (!socket.current || !currentUserName) return;
    socket.current.emit("stop typing", currentUserName);
  };

  useEffect(() => {
    socket.current = connectWS();
    socket.current.on('connect', () => {
      socket.current.on("notification", (username) => {
        console.log('====================================');
        console.log(`${username} joined the room`);
        console.log('====================================');
      })

      socket.current.on("new message", (msg) => {
        console.log('====================================');
        console.log(msg);
        console.log('====================================');
        setMessages((prev) => [...prev, msg])
      })
      socket.current.on("typing", (username) => {
        setTypers((prev) => {
          if (prev.includes(username)) return prev;
          return [...prev, username]
        })
      })
      socket.current.on("stop typing", (username) => {
        setTypers((prev) => prev.filter((u) => u !== username))
      })
    }, [])
    return () => {
      stopTypingRef.current();
      socket.current.off('notification');
      socket.current.off('new message');
      socket.current.off('typing');
      socket.current.off('stop typing');
      socket.current.disconnect();
    }
  }, [])
  // useeffect for typing 

  useEffect(() => {
    if (!text) {
      stopTypingRef.current();
      return;
    }

    socket.current.emit("typing", userName)

    clearTimeout(timer.current)

    timer.current = setTimeout(() => {
      stopTypingRef.current();
    }, 1000)

    return () => {
      clearTimeout(timer.current)
    }

  }, [text, userName])

  // FORMAT TIME
  function formatTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // NAME SUBMIT
  function handleNameSubmit(e) {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;
    // JOIN ROOM
    socket.current.emit('join room', trimmed);

    setUserName(trimmed);
    setShowNamePopup(false);
  }

  // SEND MESSAGE (UI ONLY LOCAL ADD)
  function sendMessage() {
    const t = text.trim();
    if (!t) return;

    const msg = {
      id: Date.now(),
      sender: userName,
      text: t,
      ts: Date.now(),
    };
    socket.current.emit("send message", msg);
    // setMessages((prev) => [...prev, msg]);

    setText("");
    stopTypingRef.current();
  }

  // ENTER KEY
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">

      {/* NAME POPUP */}
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-lg max-w-md p-6">
            <h1 className="text-xl font-semibold">Enter your name</h1>

            <form onSubmit={handleNameSubmit} className="mt-4">
              <input
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-green-500"
                placeholder="Your name"
              />

              <button
                type="submit"
                className="block ml-auto mt-3 px-4 py-1.5 rounded-full bg-green-500 text-white"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT UI */}
      {!showNamePopup && (
        <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <div className="h-10 w-10 rounded-full bg-[#075E54] flex items-center justify-center text-white font-semibold">
              R
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium">Realtime group chat</div>

              {typers.length ? (
                <div className="text-xs text-gray-500">
                  {typers.join(", ")} typing...
                </div>
              ) : null}
            </div>

            <div className="text-sm text-gray-500">
              {userName}
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100">
            {messages.map((m) => {
              const mine = m.sender === userName;

              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] p-3 rounded-[18px] text-sm shadow-sm ${mine
                      ? "bg-[#DCF8C6]"
                      : "bg-white"
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    <div className="flex justify-between mt-1 text-[11px]">
                      <span className="font-bold">{m.sender}</span>
                      <span className="text-gray-500">
                        {formatTime(m.ts)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center gap-2 border rounded-full">
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full resize-none px-4 py-3 text-sm outline-none"
              />

              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-4 py-2 mr-2 rounded-full text-sm"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
