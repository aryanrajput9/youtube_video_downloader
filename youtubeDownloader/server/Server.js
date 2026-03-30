const express = require("express");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");

const app = express();
app.use(cors());

// Home route
app.get("/", (req, res) => {
    res.send("API running 🚀");
});

// Debug route
app.get("/check", (req, res) => {
    res.send("WORKING NEW CODE 🔥");
});

// Download route
app.get("/download", async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL required" });
    }

    try {
        // 🔥 STEP 1: Clean URL (remove extra params)
        url = url.split("&")[0];
        url = url.split("?")[0];

        // 🔥 STEP 2: Fix Shorts → Watch
        if (url.includes("shorts/")) {
            const videoId = url.split("shorts/")[1];
            url = `https://www.youtube.com/watch?v=${videoId}`;
        }

        console.log("FINAL URL:", url);

        // 🔥 STEP 3: Validate URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        // 🔥 STEP 4: Get video info
        const info = await ytdl.getInfo(url);

        // 🔥 STEP 5: Choose best mp4 format (safe fallback)
        let format = ytdl.chooseFormat(info.formats, {
            quality: "18", // 360p (most stable)
        });

        // fallback if not found
        if (!format) {
            format = ytdl.chooseFormat(info.formats, {
                filter: "audioandvideo",
            });
        }

        if (!format) {
            return res.status(404).json({ error: "No downloadable format found" });
        }

        // ✅ RESPONSE
        res.json({
            title: info.videoDetails.title,
            downloadUrl: format.url,
        });

    } catch (err) {
        console.log("❌ ERROR FULL:", err);
        res.status(500).json({
            error: "Video fetch failed",
            message: err.message
        });
    }
});

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));