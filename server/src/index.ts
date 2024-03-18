import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();
app.use(express.json());
app.use(express.static('../client'))

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('Welcome to the WebSocket server!');
});

// Define a simple route for HTTP
app
.get('/api/token', async (req: Request, res: Response) => {
    const { token } = req.body;
    console.log("Got token!", token);

    let accessToken = await getDiscordAccessToken(token, 'https://127.0.0.1', '1219346862423933098', 'Nb5IHf3V7pcgotzkzRToMhZiciL4P5mr')
    res.send(JSON.stringify({ access_token: accessToken }));
});

async function getDiscordAccessToken(code : string, redirectUri : string, clientId : string, clientSecret : string) {
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        scope: 'identify', // Include other scopes as needed
    };

    try {
        const response = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.ok) {
            const json = await response.json() as {
                access_token: string;
                token_type: string;
                expires_in: number;
                refresh_token: string;
                scope: string;
            };  
            return {
                accessToken: json.access_token,
                tokenType: json.token_type,
                expiresIn: json.expires_in,
                refreshToken: json.refresh_token,
                scope: json.scope,
            };
        } else {
            // Handle errors, such as invalid code or invalid redirect URI
            return { error: 'Failed to obtain access token', statusCode: response.status };
        }
    } catch (error) {
        // Handle fetch error
        return { error: 'Error fetching access token', details: error };
    }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, function listening() {
    console.log(`Server is listening on port ${PORT}`);
});