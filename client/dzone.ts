import util from './script/common/util';
import Game from './script/engine/game';
import Renderer from './script/engine/renderer';
import Canvas from './script/engine/canvas';
import UI from './script/ui/ui';
import packageInfo from './package.json';
import World from './script/environment/world';
import Users from './script/actors/users';
import Decorator from './script/props/decorator';
import Preloader from './script/engine/preloader';

// TODO: Loading screen while preloading images, connecting to websocket, and generating world
var version = packageInfo.version;
console.log('Loading...', version);
var game: Game, ws: WebSocket;

export function initDzone(options: { ServerID: string, ChannelID: string, token: string }) {
    var preloader = new Preloader();
    game = new Game({ step: 1000 / 60 });
    preloader.on('complete', (images) => {
        game.renderer = new Renderer({ game: game, images });
        var canvas = new Canvas({ id: 'main', game: game, initialScale: 1, backgroundColor: '#181213' });
        game.renderer.addCanvas(canvas);
        game.bindCanvas(canvas);
        game.ui = new UI(game);
        //game.showGrid = true;
        //game.timeRenders = true;
        //initWebsocket(options);

        (window as any).game = game;
    })
}

export async function handleEventData(eventData: { type: 'server-join' | 'presence' | 'message' | 'error', data: any }) {
    var userList = eventData.data.users as { [uid: string]: { username: string, status: string } };
    const world = game.world ??= new World(game, Math.round(3.3 * Math.sqrt(Object.keys(userList).length)));
    const decorator = new Decorator(game, world);
    const users = game.users ??= new Users(game, world);
    
    //game.decorator = decorator;
    if (eventData.type === 'server-join') { // Initial server status
        var requestServer = eventData.data.serverID;
        console.log("Joined server", requestServer);
        game.reset();
        game.renderer.clear();
        
        game.setMaxListeners(Object.keys(userList).length + 50);
        users.setMaxListeners(Object.keys(userList).length);
        for (var uid in userList) {
            if (!userList.hasOwnProperty(uid)) continue;
            if (!userList[uid]?.username) continue;
            users.addActor(userList[uid]);
        }
        console.log((Object.keys(users.actors).length).toString() + ' actors created');
        game.renderer.canvases[0].onResize();
    } else if (eventData.type === 'presence') { // User status update
        users.updateActor(eventData.data)
    } else if (eventData.type === 'message') { // Chatter
        users.queueMessage(eventData.data);
    } else if (eventData.type === 'error') {
        console.log("Error", eventData);
    } else {
        console.log('Unmapped Websocket data:', eventData);
    }
}

export function initWebsocket(options: { ServerID: string, ChannelID: string, token: string }) {

    var users : Users, world : World, decorator : Decorator;

    var socketURL = `wss://${window.location.hostname}?ServerID=${options.ServerID}&ChannelID=${options.ChannelID}&Token=${options.token}`;
    console.log('Initializing websocket on', socketURL);

    // Swap the comments on the next 3 lines to switch between your websocket server and a virtual one
    ws = new WebSocket(socketURL);
    //var TestSocket from './script/engine/tester.js'),
    //ws = new TestSocket(50, 3000);
    ws.addEventListener('message', function (event) {
        var eventData = JSON.parse(event.data) as any;
        if (decorator) decorator.beacon.ping();
        handleEventData(eventData);
    });
    ws.addEventListener('open', function () { console.log('Websocket connected'); });
    ws.addEventListener('close', function () { console.log('Websocket disconnected'); });
    ws.addEventListener('error', function (err) { console.log('Websocket error:', err); });

    // window.testMessage = function(message) {
    //     var msg = message ? message.text : 'hello, test message yo!';
    //     var uid = message ? message.uid : users.actors[Object.keys(users.actors)[0]].uid;
    //     var channel = message ? message.channel : '1';
    //     ws.send('data', JSON.stringify({ type: 'message', data: {
    //         uid: uid, message: msg, channel: channel
    //     }}));
    // };
}

function joinServer(server : any) {
    var connectionMessage = { type: 'connect', data: { server: server.id } };
    console.log('Requesting to join server', server.id);
    ws.send(JSON.stringify(connectionMessage));
}