import { useState } from "react";

export default function App() {
  const [userName, setUserName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [inputName, setInputName] = useState("");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [typers] = useState([]); // dummy for UI only

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

    setMessages((prev) => [...prev, msg]);
    setText("");
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
                    className={`max-w-[78%] p-3 rounded-[18px] text-sm shadow-sm ${
                      mine
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