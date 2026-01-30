import 'dotenv/config'
import express from 'express';

process
    .on('unhandledRejection', (error) => {
        console.error(error);
    })
    .on('uncaughtException', (error) => {
        console.error(error);
    })
export async function main(args) {
    const { code } = args;
    if (!code) return { error: 'No code provided' };

    console.log("Received new access token request with oauth code:", code);

    let response = await getDiscordAccessToken(code, 'https://dzone.jmtk.co', process.env.BOT_CLIENT_ID!, process.env.BOT_CLIENT_SECRET!);
    if (!response.accessToken) {
        console.log(response);
        return response;
    }
    return { access_token: response.accessToken };
}

async function getDiscordAccessToken(code: string, redirectUri: string, clientId: string, clientSecret: string) {
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code
    };

    console.log(data);
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
            return { error: 'Failed to obtain access token', statusCode: response.status, ...(await response.json()) };
        }
    } catch (error) {
        // Handle fetch error
        return { error: 'Error fetching access token', details: error };
    }
}

console.log(__dirname);
const app = express()
    .use(express.static('public'))
    .use(express.json())
    .post('/api/token', async (req, res) => {
        const { code } = req.body;
        // ... handle the code parameter
        let response = await main({ code });
        res.status(code.statusCode ?? 200).json(response);
    });

app.listen(3009, () => {
    console.log('Server running on port 3009');
});
