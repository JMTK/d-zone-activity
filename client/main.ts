import { DiscordSDK } from "@discord/embedded-app-sdk";
import { handleEventData, initDzone } from "./dzone";

window.onunhandledrejection = (err) => console.error(err);
const clientId = '1219346862423933098';
const discordSdk = window.location.search.includes('frame_id') ? new DiscordSDK(clientId) : null;

setupDiscordSdk().then(async (auth) => {
    console.log("Discord SDK is authenticated");

    let game = await initDzone({
        ServerID: discordSdk?.guildId ?? '',
        ChannelID: discordSdk?.channelId ?? '',
        token: auth?.access_token ?? ''
    });
    let channel = await discordSdk?.commands.getChannel({ channel_id: discordSdk!.channelId! });
    handleEventData({
        type: 'server-join',
        data: {
            serverID: discordSdk?.guildId ?? '',
            users: channel?.voice_states.reduce((agg, curr) => {
                if (!agg[curr.user.id]) {
                    agg[curr.user.id] = {
                        username: curr.nick || curr.user.username,
                        status: 'online'
                    }
                }
                return agg;
            }, {})
        }
    })
    discordSdk?.subscribe('VOICE_STATE_UPDATE', voiceStateUpdateEvent => {
        console.log("VOICE_STATE_UPDATE", voiceStateUpdateEvent);
    }, { channel_id: discordSdk.channelId! });
    discordSdk?.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', activityInstanceParticipantsUpdateEvent => {
        console.log("ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE", activityInstanceParticipantsUpdateEvent);
    });
    discordSdk?.subscribe('SPEAKING_START', speakingStartEvent => {
        console.log("SPEAKING_START", speakingStartEvent);
        handleEventData({
            type: 'message',
            data: {
                uid: speakingStartEvent.user_id,
                message: 'I am speaking!',
                channel: speakingStartEvent.channel_id
            }
        });

    }, { channel_id: discordSdk.channelId, lobby_id: discordSdk.instanceId });
});

async function setupDiscordSdk() {
    if (discordSdk == null) return;
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    let state = crypto.randomUUID();
    // Authorize with Discord Client
    const { code } = await discordSdk.commands.authorize({
        client_id: clientId,
        response_type: "code",
        state,
        prompt: "none",
        scope: [
            "identify",
            "guilds",
            "rpc.voice.read"
        ],
    });
    console.log("Got code", code);

    // Retrieve an access_token from your activity's server
    const response = await fetch("/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
        }),
    });
    const { access_token } = await response.json();

    // Authenticate with Discord client (using the access_token)
    const auth = await discordSdk.commands.authenticate({
        access_token
    });

    
    if (auth == null) {
        throw new Error("Authenticate command failed");
    }

    if (auth)

    return auth;
}
