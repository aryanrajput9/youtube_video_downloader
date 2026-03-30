const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("API running 🚀"));
app.get("/check", (req, res) => res.send("WORKING 🔥"));

app.get("/download", async (req, res) => {
    let { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL required" });

    try {
        const urlObj = new URL(url);

        // 🔥 Normalize URL
        if (urlObj.hostname === "youtu.be") {
            const videoId = urlObj.pathname.replace("/", "");
            url = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (urlObj.hostname.includes("youtube.com")) {
            if (url.includes("shorts/")) {
                const videoId = urlObj.pathname.split("shorts/")[1];
                url = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                const videoId = urlObj.searchParams.get("v");
                if (videoId) {
                    url = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }
        }
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    console.log("FINAL URL:", url);

    // 🔥 cookies file ka absolute path
    const cookiesPath = path.join(__dirname, "cookies.txt");

    // 🔥 yt-dlp args (WITH COOKIES)
    const args = [
        "-j",
        "--no-playlist",
        "--cookies",
        cookiesPath,
        "--extractor-args",
        "youtube:player_client=android",
        url
    ];

    const process = spawn("yt-dlp", args);

    let data = "";
    let errorData = "";

    process.stdout.on("data", chunk => {
        data += chunk.toString();
    });

    process.stderr.on("data", chunk => {
        errorData += chunk.toString();
    });

    process.on("close", code => {
        if (code !== 0) {
            console.error("yt-dlp error:", errorData);
            return res.status(500).json({
                error: "Video fetch failed",
                message: errorData
            });
        }

        try {
            const info = JSON.parse(data);

            // 🔥 Best format select
            let format =
                info.formats.find(f => f.ext === "mp4" && f.height === 360 && f.acodec !== "none") ||
                info.formats.find(f => f.ext === "mp4" && f.acodec !== "none") ||
                info.formats[info.formats.length - 1];

            if (!format) {
                return res.status(404).json({ error: "No downloadable format found" });
            }

            res.json({
                title: info.title,
                thumbnail: info.thumbnail,
                duration: info.duration,
                downloadUrl: format.url
            });

        } catch (err) {
            res.status(500).json({
                error: "Parse failed",
                message: err.message
            });
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));