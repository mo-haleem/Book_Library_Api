const Joi = require("joi");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/bookLibrary")
  .then(() => console.log("connected to MongoDB"))
  .catch((error) => console.error("could not connect to MongoDB", error));

app.use(express.json());

const bookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model("Book", bookSchema);

function validateBook(book) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    genre: Joi.string().min(5).max(255).required(),
    author: Joi.string().min(2).max(255).required(),
  });
  return schema.validate(book);
}

app.get("/", (req, res) => {
  res.send("Welcome to my Book API library");
});

app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

app.get("/books/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  return res.send(book);

  if (!book) {
    return res.status(404).send("Book not found");
  }
});

app.put("/books/:id", async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: req.body.genre,
      author: req.body.author,
    },
    { returnDocument: "after", runValidators: true },
  );

  res.send(book);
});

app.post("/books", async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const existingBook = await Book.findOne({ title: req.body.title });
  if (existingBook) return res.status(400).send("The book already exists");

  const newBook = new Book({
    title: req.body.title,
    genre: req.body.genre,
    author: req.body.author,
  });

  await newBook.save();
  res.send(newBook);
});

app.delete("/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) return res.status(404).send("Book not found");
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
