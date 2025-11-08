import express from 'express';
import * as db from '../database/queries.js';

const api = express.Router();

api.get('/test', (req, res) => {
  res.send('API is working properly');
});

// Get all users
api.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    if (users) {
      res.status(200).json(users);
    } else {
      res.status(500).send('Failed to fetch users');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Get user by name
api.get('/users/:name', async (req, res) => {
  try {
    const user = await db.getUserInfo(req.params.name);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Update user
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

// Delete user
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
