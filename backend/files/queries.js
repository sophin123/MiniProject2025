// SQL Queries for FileShare Application

// Files table queries
const CREATE_FILES_TABLE = `
  CREATE TABLE IF NOT EXISTS files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filetype VARCHAR(50) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES authentication.users(id) ON DELETE CASCADE
  )
`;

const INSERT_FILE = `
  INSERT INTO files (user_id, filename, filepath, filetype, size) 
  VALUES (?, ?, ?, ?, ?)
`;

const GET_FILES_BY_USER = `
  SELECT * FROM files 
  WHERE user_id = ? 
  ORDER BY uploaded_at DESC
`;

const GET_FILE_BY_ID = `
  SELECT * FROM files 
  WHERE id = ?
`;

const DELETE_FILE_BY_ID = `
  DELETE FROM files 
  WHERE id = ?
`;

// Snippets table queries
const CREATE_SNIPPETS_TABLE = `
  CREATE TABLE IF NOT EXISTS snippets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES authentication.users(id) ON DELETE CASCADE
  )
`;

const INSERT_SNIPPET = `
  INSERT INTO snippets (user_id, text) 
  VALUES (?, ?)
`;

const GET_SNIPPETS_BY_USER = `
  SELECT * FROM snippets 
  WHERE user_id = ? 
  ORDER BY created_at DESC
`;

const DELETE_SNIPPET_BY_ID = `
  DELETE FROM snippets 
  WHERE id = ?
`;

module.exports = {
  // Files queries
  CREATE_FILES_TABLE,
  INSERT_FILE,
  GET_FILES_BY_USER,
  GET_FILE_BY_ID,
  DELETE_FILE_BY_ID,
  
  // Snippets queries
  CREATE_SNIPPETS_TABLE,
  INSERT_SNIPPET,
  GET_SNIPPETS_BY_USER,
  DELETE_SNIPPET_BY_ID
};
