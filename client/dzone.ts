import Game from './script/engine/game';
import Renderer from './script/engine/renderer';
import Canvas from './script/engine/canvas';
import UI from './script/ui/ui';
import packageInfo from './package.json';
import World from './script/environment/world';
import Users from './script/actors/users';
import Decorator from './script/props/decorator';
import Preloader from './script/engine/preloader';

console.time('Init');
// TODO: Loading screen while preloading images, connecting to websocket, and generating world
const version = packageInfo.version;
console.log('Loading...', version);
let game: Game, ws: WebSocket, decorator: Decorator | null = null;

export async function initDzone() {
    const preloader = new Preloader();
    await preloader.load();
    game = new Game({ step: 1000 / 60 });
    game.renderer = new Renderer({
        game: game,
        images: preloader.images
    });
    const canvas = new Canvas({
        id: 'main',
        game: game,
        initialScale: 2,
        backgroundColor: '#181213'
    });
    game.renderer.addCanvas(canvas);
    game.bindCanvas(canvas);
    game.ui = new UI(game);
    game.showGrid = true;
    game.timeRenders = true;

    addUIOverlay(game);
    (window as any).game = game;

    return game;
}

export async function handleEventData(eventData: { type: 'server-join' | 'presence' | 'message' | 'error' | 'userchange', data: any }) {
    const userList = eventData.data.users as { [uid: string]: { uid: string, username: string, status: string, roleColor?: string } };
    let world = game.world;
    let users = game.users;

    decorator?.beacon.ping();

    if (eventData.type === 'server-join') { // Initial server status
        const requestServer = eventData.data.serverID;
        console.log('Joined server', requestServer);
        game.reset();
        game.renderer.clear();

        const userlistLength = Object.keys(userList).length;
        world = game.world = new World(game, Math.round(3.3 * Math.sqrt(userlistLength)));
        decorator ??= new Decorator(game, world);
        users = game.users = new Users(game, world);
        game.decorator = decorator;
        game.setMaxListeners(userlistLength + 50);
        users.setMaxListeners(userlistLength);
        for (const uid in userList) {
            users.updateActor(userList[uid]!);
        }
        console.log(userlistLength, 'actors created');
        game.renderer.canvases[0].onResize();
        console.timeEnd('Init');
    }
    else if (eventData.type === 'userchange') {
        if (game?.world?.actors) {
            for (const [uid, user] of Object.entries(game.world.actors)) {
                // user is not in the full participants list
                if (!userList[uid]) {
                    users.removeActor(user);
                }
            }
            for (const [uid, user] of Object.entries(userList)) {
                users.updateActor({
                    ...user
                });
            }
        }
    }
    else if (eventData.type === 'presence') { // User status update
        users.updateActor(eventData.data);
    }
    else if (eventData.type === 'message') { // Chatter
        users.queueMessage(eventData.data);
    }
    else if (eventData.type === 'error') {
        console.log('Error', eventData);
    }
    else {
        console.log('Unmapped Websocket data:', eventData);
    }
}

function addUIOverlay(game: Game) {
    game.ui.addButton({
        text: 'Map',
        bottom: 47,
        right: 3,
        w: 40,
        h: 18,
        onPress: function () {
            if (game.mapPanel) {
                game.mapPanel.remove();
                game.mapPanel = null;
                return;
            }

            game.mapPanel = game.ui.addPanel({
                left: 'auto',
                top: 'auto',
                w: 200,
                h: 100
            });
            game.ui.addLabel({
                text: 'Choose a level',
                top: 1,
                left: 'auto',
                parent: game.mapPanel
            });
            game.ui.addButton({
                text: 'Plains',
                top: 15,
                left: 'auto',
                parent: game.mapPanel,
                onPress: function () {
                    game.level = 'plain';
                    game.emit('levelChange');
                }
            });
            game.ui.addButton({
                text: 'Beach',
                top: 35,
                left: 'auto',
                parent: game.mapPanel,
                onPress: function () {
                    game.level = 'beach';
                    game.emit('levelChange');
                }
            });
            
            game.ui.addButton({
                text: 'Factory',
                top: 55,
                left: 'auto',
                parent: game.mapPanel,
                onPress: function () {
                    game.level = 'factory';
                    game.emit('levelChange');
                }
            });
        }
    });
    const soundBtn = game.ui.addButton({
        text: 'Music On',
        bottom: 25,
        right: 3,
        w: 60,
        h: 18,
        onPress: function () {
            const audio = document.querySelector('audio');
            if (!audio) return;
            if (audio.volume > 0) {
                audio.volume = 0;
                soundBtn.changeText('Music Off');
            }
            else {
                audio.volume = 0.4;
                soundBtn.changeText('Music On');
            }
        }
    });
    game.ui.addButton({
        text: '?',
        bottom: 3,
        right: 3,
        w: 40,
        h: 18,
        onPress: function () {
            if (game.helpPanel) {
                game.helpPanel.remove();
                game.helpPanel = null;
                return;
            }

            const panelWidth = 400;
            game.helpPanel = game.ui.addPanel({
                left: 'auto',
                top: 'auto',
                w: panelWidth,
                h: 150
            });
            game.ui.addLabel({
                text: `D-Zone ${version}`,
                top: 5,
                left: 'auto',
                parent: game.helpPanel
            });
            game.ui.addLabel({
                text: packageInfo.description,
                top: 20,
                left: 2,
                maxWidth: panelWidth - 8,
                parent: game.helpPanel
            });

            game.ui.addLabel({
                text: ':icon-github: View on GitHub',
                hyperlink: 'https://github.com/JMTK/d-zone-activity',
                top: 60,
                right: 8,
                parent: game.helpPanel
            });

            const musicAttr = `Morning Dew by Arthur Vyncke | https://soundcloud.com/arthurvost
Music promoted by https://www.free-stock-music.com
Creative Commons / Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
https://creativecommons.org/licenses/by-sa/3.0/deed.en_US`;

            for (let i = 0, musicAttrSpl = musicAttr.split('\n'); i < musicAttrSpl.length; i++) {
                game.ui.addLabel({
                    text: musicAttrSpl[i]!.trim(),
                    maxWidth: panelWidth - 8,
                    top: 80 + i * 11,
                    left: 2,
                    parent: game.helpPanel
                });
            }
        }
    });
}
