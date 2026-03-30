const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("API running 🚀"));
app.get("/check", (req, res) => res.send("WORKING 🔥"));

app.get("/download", async (req, res) => {
    let { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL required" });

    // 🔥 Clean URL
    try {
        const urlObj = new URL(url);

        if (urlObj.hostname === "youtu.be") {
            const videoId = urlObj.pathname.replace("/", "");
            url = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (urlObj.hostname.includes("youtube.com")) {
            if (url.includes("shorts/")) {
                const videoId = urlObj.pathname.split("shorts/")[1];
                url = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                const videoId = urlObj.searchParams.get("v");
                if (videoId) url = `https://www.youtube.com/watch?v=${videoId}`;
            }
        }
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    console.log("FINAL URL:", url);

    // 🔥 Android client use karo - JS runtime ki zaroorat nahi
    const command = `yt-dlp -j --no-playlist --extractor-args "youtube:player_client=android" "${url}"`;

    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error("yt-dlp error:", stderr);
            return res.status(500).json({
                error: "Video fetch failed",
                message: stderr
            });
        }

        try {
            const info = JSON.parse(stdout);

            // 360p mp4 format dhundo
            const format = info.formats.find(
                f => f.ext === "mp4" && f.height === 360 && f.acodec !== "none"
            ) || info.formats.find(
                f => f.ext === "mp4" && f.acodec !== "none"
            ) || info.formats[info.formats.length - 1];

            if (!format) {
                return res.status(404).json({ error: "No downloadable format found" });
            }

            res.json({
                title: info.title,
                thumbnail: info.thumbnail,
                duration: info.duration,
                downloadUrl: format.url
            });

        } catch (parseErr) {
            res.status(500).json({ error: "Parse failed", message: parseErr.message });
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));