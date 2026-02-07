/**
 * Létrehoz egy jegyzet objektumot validációval.
 * @param {number} userId
 * @param {string} title
 * @param {string} content
 * @returns {{userId:number, title:string, content:string}}
 */
function createNote(userId, title, content) {
  if (!userId) {
    throw new Error("UserId is required");
  }

  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }

  if (!content || content.trim() === "") {
    throw new Error("Content is required");
  }

  return {
    userId,
    title: title.trim(),
    content: content.trim(),
  };
}

module.exports = { createNote };
