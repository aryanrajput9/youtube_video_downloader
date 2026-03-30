const express = require("express");
const cors = require("cors");
const youtubedl = require("yt-dlp-exec");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running 🚀");
});

app.get("/download", async (req, res) => {
    const { url } = req.query;

    // ✅ Check URL
    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        // ✅ Fetch video info
        const data = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true
        });

        // ✅ Find best format (with video + audio)
        const format = data.formats.find(
            (f) => f.ext === "mp4" && f.acodec !== "none"
        );

        if (!format) {
            return res.status(404).json({ error: "No downloadable format found" });
        }

        // ✅ Send download link
        res.json({
            title: data.title,
            thumbnail: data.thumbnail,
            downloadUrl: format.url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch video" });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});