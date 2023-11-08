// PASSWORD: y5YSicIOzDWvrMWj -> DON'T FORGET TO DELETE AFTER FINISH

const mongoose = require("mongoose");

const argument = process.argv;

if (argument.length !== 3 && argument.length !== 5) {
  console.log("Please provide valid argument");
  process.exit(1);
}

const password = argument[2];
const name = argument[3];
const number = argument[4];

const url = `mongodb+srv://khanzaarrayyan:${password}@cluster0.yudyzzj.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Note = mongoose.model("Person", noteSchema);

const note = new Note({
  name: name,
  number: number,
});

if (argument.length === 3) {
  console.log("phonebook:");
  Note.find({}).then((result) => {
    result.forEach((note) => {
      console.log(`${note.name} ${note.number}`);
    });
    mongoose.connection.close();
  });
}

if (argument.length === 5) {
  note.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
