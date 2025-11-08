import express from 'express';
import * as db from '../database/queries.js';

const api = express.Router();

api.get('/test', (req, res) => {
  res.send('API is working properly');
});

// Note: Read operations (get users, search) are handled by MCP server
// This API focuses on write operations and authentication

// Update user - Modify user/village information
api.put('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await db.updateUser(id, req.body);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('User not found or update failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Delete user - Remove user/village from network
api.delete('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.deleteUser(id);
    if (result) {
      res.status(200).send('User deleted successfully');
    } else {
      res.status(404).send('User not found or delete failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

export default api;
