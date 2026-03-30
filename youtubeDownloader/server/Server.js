const express = require("express");
const cors = require("cors");
const youtubedl = require("yt-dlp-exec");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/download", async (req, res) => {
    const { url } = req.query;

    try {
        const data = await youtubedl(url, {
            dumpSingleJson: true
        });

        res.json({
            title: data.title,
            thumbnail: data.thumbnail,
            url: data.webpage_url
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});