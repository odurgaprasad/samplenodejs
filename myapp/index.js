const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const port = 4000;
const dbPath = path.join(__dirname, "goodreads.db");
let db; // Change 'const' to 'let' for dynamic assignment

const initializeAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Connected to the database");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeAndDatabase();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get("/books", async (req, res) => {
  const getBooksQuery = `
    SELECT *
    FROM book
    ORDER BY book_id
  `;
  const getBooks = await db.all(getBooksQuery);
  res.json(getBooks);
});

app.get("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = `
    SELECT *
    FROM book
    WHERE book_id = ${bookId}
  `;
  const getBook = await db.get(getBookQuery);
  if (getBook) {
    res.json(getBook);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.post("/books", async (req, res) => {
  const { title, name, age, book_id } = req.body;

  const insertBookQuery = `
    INSERT INTO book (title, name, age, book_id)
    VALUES ('${title}', '${name}', ${age}, ${book_id})
  `;

  try {
    const result = await db.run(insertBookQuery);
    const bookId = result.lastID;
    res.json({ bookId });
  } catch (error) {
    console.log(`Insert Error: ${error.message}`);
    res.status(500).json({ error: "Failed to insert book" });
  }
});
