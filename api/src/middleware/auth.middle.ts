import jwt from 'jsonwebtoken';
import * as db from '../database/queries.js';
import { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function signUp(req: Request, res: Response) {
  try {
    const response = await db.signUp({
      name: req.body.name,
      location: req.body.location,
      coordinates: req.body.coordinates,
      facts: req.body.facts || []
    });
    if (response) {
      res.status(200).send('Successfully signed up user');
    } else {
      res.status(400).send('Failed to sign up user');
    }
  } catch (err) {
    console.error(err, 'error');
    return res.status(500).send('Internal server error');
  }
}

async function login(req: Request, res: Response) {
  try {
    const userInfo = await db.getUserInfo(req.body.name);
    if (!userInfo) {
      return res.status(401).send('User not found');
    }

    // Create JWT token with user info
    jwt.sign(
      { userInfo },
      process.env.SECRET_KEY,
      { expiresIn: '100000s' },
      (err: any, token: any) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Token generation failed');
        }

        return res
          .status(200)
          .cookie('jwt', token, {
            sameSite: 'none',
            secure: true,
            path: '/',
            httpOnly: true,
            expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            partitioned: false
          })
          .send('Authentication successful');
      }
    );
  } catch (err) {
    console.error(err, 'error');
    return res.status(500).send('Internal server error');
  }
}

async function verify(req: Request, res: Response) {
  const token = req.cookies.jwt;
  if (!token) {
    console.log('Not logged in');
    return res.status(401).send('Authentication required');
  }

  jwt.verify(token, process.env.SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      console.log('Token verification error:', err);
      return res.status(401).send('Invalid or expired token');
    }
    console.log(decoded.userInfo);
    req.user = decoded.userInfo;
    res.status(200).json({ user: req.user });
  });
}

async function logOut(req: Request, res: Response) {
  res.clearCookie('jwt');
  res.status(200).send('Logged out');
}

export { signUp, login, verify, logOut };
