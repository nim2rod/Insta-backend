const logger = require('./logger.service')

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('set-story-socket', storyId => {
            logger.info(`New connected story-socket [id: ${storyId}]`)
            if (socket.myStory === storyId) return
            if (socket.myStory) {
                socket.leave(socket.myStory)
                logger.info(`Socket is leaving topic ${socket.myStory} [id: ${socket.id}]`)
            }
            socket.join(storyId)
            socket.myStory = storyId
        })
        socket.on('this-user-add-comment', story => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myStory}`)
            // gIo.to(socket.myStory).emit('other-user-add-comment', story)
            gIo.emit('other-user-add-comment', story)
        })
        socket.on('this-user-add-like', story => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myStory}`)
            gIo.emit('other-user-add-like', story)
        })
        socket.on('this-user-add-like-to-comment', story => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myStory}`)
            gIo.emit('other-user-add-like-to-story', story)
        })
        socket.on('this-user-saved-story', user => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myStory}`)
            gIo.emit('other-device-save-story', user)
        })
    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
        // _printSockets()
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
}
