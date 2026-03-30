import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("vi-VN");

  const recognitionRef = useRef(null);

  // INIT SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("❌ Trình duyệt không hỗ trợ");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;
  }, []);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // Clean text
  const cleanText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // 🎤 START
  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.lang = language;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setText(speechText);
      setListening(false);

      const cleaned = cleanText(speechText);
      const keyword = cleaned.split(" ").slice(0, 3).join(" ");

      searchSong(keyword);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("❌ Không nhận diện được giọng nói");
    };
  };

  // ⏹ STOP
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // 🔍 SEARCH
  const searchSong = async (query) => {
    try {
      const res = await fetch(
        `https://api.lyrics.ovh/suggest/${query}`
      );
      const data = await res.json();

      if (data.data && data.data.length > 0) {
        const song = data.data[0];

        const resultData = {
          title: song.title,
          artist: song.artist.name,
          preview: song.preview,
        };

        setResult(resultData);

        setHistory((prev) => {
          const newHistory = [resultData, ...prev];
          return newHistory.slice(0, 5);
        });
      } else {
        setResult(null);
      }
    } catch {
      alert("❌ Lỗi API");
    }
  };

  // ❌ clear result
  const clearResult = () => {
    setResult(null);
    setText("");
  };

  // 🗑️ clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
  };

  // 🚪 EXIT
  const handleExit = () => {
    if (window.confirm("Bạn có chắc muốn thoát?")) {
      window.location.href = "about:blank";
    }
  };

  return (
    <div className="app">
      <h1>🎵 Nhận diện bài hát</h1>

      {/* 🌍 Language */}
      <select
        className="select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="vi-VN">🇻🇳 Tiếng Việt</option>
        <option value="en-US">🇺🇸 English</option>
      </select>

      <div>
        <button className="btn" onClick={startListening}>
          {listening ? "🎙️ Đang nghe..." : "🎤 Start"}
        </button>

        <button className="btn-stop" onClick={stopListening}>
          ⏹ Stop
        </button>
      </div>

      <p className="text">📝 {text}</p>

      {/* RESULT */}
      {result ? (
        <div className="result">
          <h2>🎶 {result.title}</h2>
          <p>🎤 {result.artist}</p>

          {result.preview && (
            <audio controls src={result.preview}></audio>
          )}

          <button className="btn-clear" onClick={clearResult}>
            Xóa kết quả
          </button>
        </div>
      ) : (
        text && <p className="not-found">❌ Không tìm thấy bài hát</p>
      )}

      {/* HISTORY */}
      <div className="history">
        <h3>📜 Lịch sử</h3>

        {history.length === 0 && <p>Chưa có lịch sử</p>}

        {history.map((item, index) => (
          <div key={index} className="history-item">
            🎶 {item.title} - {item.artist}
          </div>
        ))}

        {history.length > 0 && (
          <button className="btn-clear" onClick={clearHistory}>
            🗑️ Xóa lịch sử
          </button>
        )}
      </div>

      {/* 🚪 EXIT */}
      <button className="btn-exit" onClick={handleExit}>
        🚪 Thoát ứng dụng
      </button>
    </div>
  );
}

export default App;