
// Get HTML elements
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesContainer = document.getElementById("notesContainer");

// GET API: Load all notes
async function loadNotes() {
    try {
        const response = await fetch("/notes");

        if (!response.ok) {
            throw new Error("Failed to load notes");
        }

        const notes = await response.json();

        notesContainer.innerHTML = "";

        if (notes.length === 0) {
            notesContainer.textContent =
                "No notes yet. Create your first note!";
            return;
        }

        notes.forEach(note => {
            const card = document.createElement("article");
            card.className = "note-card";

            const title = document.createElement("h3");
            title.textContent = note.title;

            const content = document.createElement("p");
            content.textContent = note.content;

            const date = document.createElement("div");
            date.className = "note-date";
            date.textContent =
                new Date(note.createdAt).toLocaleString();

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", () => {
                deleteNote(note.id);
            });

            card.appendChild(title);
            card.appendChild(content);
            card.appendChild(date);
            card.appendChild(deleteButton);

            notesContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        notesContainer.textContent = "Unable to load notes.";
    }
}

// POST API: Create a note
noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("Please enter title and content.");
        return;
    }

    try {
        const response = await fetch("/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create note");
        }

        noteForm.reset();
        await loadNotes();

    } catch (error) {
        console.error(error);
        alert("Unable to save note.");
    }
});

// DELETE API: Delete a note
async function deleteNote(id) {
    const confirmed = confirm("Are you sure you want to delete this note?");

    if (!confirmed) return;

    try {
        const response = await fetch(
            `/notes/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        if (!response.ok) {
            throw new Error("Failed to delete note");
        }

        await loadNotes();

    } catch (error) {
        console.error(error);
        alert("Unable to delete note.");
    }
}

// Load notes when page opens
loadNotes();
