import { DiscordSDK } from "@discord/embedded-app-sdk";
import { handleEventData, initDzone } from "./dzone";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.onunhandledrejection = (err) => console.error(err);
const clientId = '1219346862423933098';
const discordSdk = window.location.search.includes('frame_id') ? new DiscordSDK(clientId) : null;

let dzone = initDzone();
setupDiscordSdk().then(async (auth) => {
    console.log("Discord SDK is authenticated");
    let channel = await discordSdk?.commands.getChannel({ channel_id: discordSdk!.channelId! });

    await dzone;
    handleEventData({
        type: 'server-join',
        data: {
            serverID: discordSdk?.guildId ?? '',
            users: channel?.voice_states.reduce((agg, curr) => {
                if (!agg[curr.user.id]) {
                    agg[curr.user.id] = {
                        username: curr.nick || curr.user.username,
                        status: curr.voice_state.deaf ? 'offline' : 'online'
                    }
                }
                return agg;
            }, {})
        }
    })
    discordSdk?.subscribe('VOICE_STATE_UPDATE', voiceStateUpdateEvent => {
        console.log("VOICE_STATE_UPDATE", voiceStateUpdateEvent);
        handleEventData({
            type: 'presence',
            data: {
                uid: voiceStateUpdateEvent.user.id,
                delete: voiceStateUpdateEvent.voice_state.deaf,
                status: voiceStateUpdateEvent.voice_state.deaf ? 'offline' : 'online',
            }
        });

    }, { channel_id: discordSdk.channelId! });
    discordSdk?.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', activityInstanceParticipantsUpdateEvent => {
        console.log("ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE", activityInstanceParticipantsUpdateEvent);
        const users = activityInstanceParticipantsUpdateEvent.participants.reduce((agg, curr) => {
            if (!agg[curr.id]) {
                agg[curr.id] = {
                    username: curr.nickname || curr.username,
                    status: 'online'
                }
            }
            return agg;
        }, {});
        handleEventData({
            type: 'userchange',
            data: {
                users
            }
        })
    });

    let userIsSpeaking = {} as Record<string, boolean>;
    discordSdk?.subscribe('SPEAKING_START', speakingStartEvent => {
        console.log("SPEAKING_START", speakingStartEvent);
        userIsSpeaking[speakingStartEvent.user_id] = true;

    }, { channel_id: discordSdk.channelId });

    setInterval(async () => {
        for (let uid in userIsSpeaking) {
            if (userIsSpeaking[uid]) {
                handleEventData({
                    type: 'message',
                    data: {
                        uid,
                        message: generateText(),
                        channel: 'global'
                    }
                });
            }
        }
    }, 1000);
});

function generateText() {
    var numWordsToGenerate = Math.floor(Math.random() * 10000) + 1;
    var punctuationSeed = Math.random();
    var punctuation = punctuationSeed > 0.5 ? '.' : (punctuationSeed > 0.25 ? '!' : '?')
    var words = ['flingin', 'flargle', 'argle', 'bargle', 'fop', 'doodle', 'swoop', 'zoodle', 'larkin', 'blarkin', 'zarkin', 'sul', 'feebee', 'dag', 'woofum', 'lalo', 'hooba', 'nobee', 'waa'];

    let sentence = new Array(numWordsToGenerate).fill(null).map(() => words[Math.floor(Math.random() * words.length)]).join(' ') + punctuation;
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

async function setupDiscordSdk() {
    if (discordSdk == null) return;
    await discordSdk.ready();

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

    return auth;
}
