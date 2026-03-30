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

    // 🔥 Clean URL - youtu.be aur youtube.com dono handle karo
    try {
        const urlObj = new URL(url);

        if (urlObj.hostname === "youtu.be") {
            // youtu.be/VIDEO_ID?si=xxx format
            const videoId = urlObj.pathname.replace("/", "");
            url = `https://www.youtube.com/watch?v=${videoId}`;
        } else if (urlObj.hostname.includes("youtube.com")) {
            if (url.includes("shorts/")) {
                // Shorts URL
                const videoId = urlObj.pathname.split("shorts/")[1];
                url = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                // Normal watch URL - sirf v param rakho
                const videoId = urlObj.searchParams.get("v");
                if (videoId) url = `https://www.youtube.com/watch?v=${videoId}`;
            }
        }
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    console.log("FINAL URL:", url);

    // yt-dlp se info fetch karo
    const command = `yt-dlp -j --no-playlist "${url}"`;

    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
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
            );

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