require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Phonebook = require("./models/note");

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  Phonebook.find({}).then((poepleList) => {
    res.json(poepleList);
  });
});

app.get("/info", (req, res) => {
  Phonebook.find({}).then((poepleList) => {
    res.send(`
    <p>Phonebook has info for ${poepleList.length} people</p>
    <p>${Date()}</p>
    `);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Phonebook.findById(id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Phonebook.findByIdAndDelete(id)
    .then((result) => res.status(204).end())
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Phonebook.findByIdAndUpdate(id, person, { new: true })
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res) => {
  const randomId = Math.floor(Math.random() * 9999) + 1;
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  const foundSamePerson = persons.find((person) => person.name === body.name);

  if (foundSamePerson) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = new Phonebook({
    id: randomId,
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
