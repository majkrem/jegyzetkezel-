const { createNote } = require("../server/services/noteService");

describe("NoteService - createNote", () => {

  test("Happy path: jegyzet létrehozása sikeres", () => {
    const note = createNote(1, "Teszt cím", "Teszt tartalom");

    expect(note).toEqual({
      userId: 1,
      title: "Teszt cím",
      content: "Teszt tartalom",
    });
  });

  test("Hibás eset: üres cím esetén hibát dob", () => {
    expect(() => {
      createNote(1, "", "Van tartalom");
    }).toThrow("Title is required");
  });

});
