
// Import required modules
const express = require("express");
const fs = require("fs");
const path = require("path");

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Define JSON storage paths
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "notes.json");

// Create data folder if it does not exist
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

// Create notes.json if it does not exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Function to read notes
function readNotes() {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
}

// Function to save notes
function saveNotes(notes) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(notes, null, 2),
        "utf8"
    );
}

// ------------------------------------
// GET API - Retrieve all notes
// ------------------------------------
app.get("/notes", (req, res) => {
    try {
        const notes = readNotes();
        res.status(200).json(notes);
    } catch (error) {
        console.error("GET Error:", error);

        res.status(500).json({
            message: "Unable to retrieve notes"
        });
    }
});

// ------------------------------------
// POST API - Create a new note
// ------------------------------------
app.post("/notes", (req, res) => {
    try {
        const { title, content } = req.body || {};

        // Validate note information
        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const notes = readNotes();

        // Create new note
        const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        // Add note to beginning of array
        notes.unshift(newNote);

        // Save updated notes
        saveNotes(notes);

        res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });

    } catch (error) {
        console.error("POST Error:", error);

        res.status(500).json({
            message: "Unable to create note"
        });
    }
});

// ------------------------------------
// DELETE API - Delete a note
// ------------------------------------
app.delete("/notes/:id", (req, res) => {
    try {
        const notes = readNotes();

        // Remove note matching the ID
        const updatedNotes = notes.filter(
            note => note.id !== req.params.id
        );

        // Check whether note exists
        if (updatedNotes.length === notes.length) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        // Save updated notes
        saveNotes(updatedNotes);

        res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("DELETE Error:", error);

        res.status(500).json({
            message: "Unable to delete note"
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
