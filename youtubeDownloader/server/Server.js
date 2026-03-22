const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

app.get("/download", (req, res) => {
    const url = req.query.url;

    if (!url) return res.send("No URL provided");

    // yt-dlp ka path (same folder me hai)
    const ytdlpPath = path.join(__dirname, "yt-dlp.exe");

    const command = `"${ytdlpPath}" -f best -o "%(title)s.%(ext)s" ${url}`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return res.send("Download failed ❌");
        }

        res.send("Download completed ✅ (check server folder)");
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});