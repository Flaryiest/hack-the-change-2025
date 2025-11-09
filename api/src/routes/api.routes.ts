import express, { Request, Response } from 'express';
import * as db from '../database/queries.js';
import * as mcpFunctions from '../services/mcp-functions.js';
import * as aiService from '../services/ai.service.js';

const api = express.Router();

api.get('/test', (req, res) => {
  res.send('API is working properly');
});

api.post('/match', async (req, res) => {
  try {
    const { query, userName, useAI = true } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    let matchResults;
    let aiInterpretation;
    let aiRecommendation;

    if (useAI) {
      aiInterpretation = await aiService.interpretQuery({
        query,
        userName
      });

      matchResults = await mcpFunctions.matchUserNeed({
        userName,
        need: query,
        keywords: aiInterpretation.keywords,
        location: aiInterpretation.location
      });

      if (matchResults.matches.length > 0) {
        aiRecommendation = await aiService.generateMatchRecommendations(
          query,
          matchResults.matches
        );
      }
    } else {
      matchResults = await mcpFunctions.matchUserNeed({
        userName,
        need: query
      });
    }

    res.status(200).json({
      query,
      userName: userName || 'Anonymous',
      interpretation: aiInterpretation?.interpretation,
      aiRecommendation,
      matchCount: matchResults.matches.length,
      matches: matchResults.matches,
      requestingUser: matchResults.requestingUser
    });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

api.get('/search/location/:location', async (req, res) => {
  try {
    const users = await mcpFunctions.searchUsersByLocation(req.params.location);
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

api.get('/search/skill/:keyword', async (req, res) => {
  try {
    const users = await mcpFunctions.searchUsersByFact(req.params.keyword);
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

api.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      res.status(400).json({ error: 'Both text and targetLanguage are required' });
      return;
    }

    const translation = await aiService.translateText(text, targetLanguage);
    
    res.status(200).json({
      translatedText: translation,
      targetLanguage
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default api;
