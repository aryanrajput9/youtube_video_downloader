const express = require("express");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");

const app = express();
app.use(cors());

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
        // 🔥 Shorts → Watch fix
        url = url.replace("shorts/", "watch?v=").split("?")[0];

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        const info = await ytdl.getInfo(url);

        const format = ytdl.chooseFormat(info.formats, {
            quality: "18", // 360p
        });

        if (!format) {
            return res.status(404).json({ error: "Format not found" });
        }

        res.json({
            title: info.videoDetails.title,
            downloadUrl: format.url,
        });

    } catch (err) {
        console.log("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running 🚀"));