const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("API running 🚀");
});

app.get("/download", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL required" });
    }

    try {
        const info = await ytdl.getInfo(url);

        const format = ytdl.chooseFormat(info.formats, {
            quality: "18", // 360p mp4
        });

        res.json({
            title: info.videoDetails.title,
            downloadUrl: format.url,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Video fetch failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));