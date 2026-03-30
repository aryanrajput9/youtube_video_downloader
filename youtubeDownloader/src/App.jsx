import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return alert("Please enter a URL");

    try {
      setLoading(true);

      const res = await fetch(
        `https://youtube-video-downloader-t991.onrender.com/download?url=${encodeURIComponent(url)}`
      );

      const data = await res.json();

      if (data.downloadUrl) {
        window.open(data.downloadUrl); // ✅ actual video open
      } else {
        alert("Download failed");
      }

    } catch (err) {
      alert("Error downloading video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">

        <h1 className="text-3xl font-bold text-white mb-6 tracking-wide">
          🎥 YouTube Downloader
        </h1>

        <input
          type="text"
          placeholder="Paste YouTube link..."
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white outline-none focus:border-green-400 transition"
        />

        <button
          onClick={handleDownload}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold transition shadow-lg shadow-green-500/30"
        >
          {loading ? "Downloading..." : "Download 🚀"}
        </button>

        <p className="text-gray-400 text-sm mt-4">
          Paste your link and download instantly
        </p>
      </div>
    </div>
  );
}

export default App;