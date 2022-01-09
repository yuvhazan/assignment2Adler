const net = require('net')
const fs = require('fs')
const clientList = []
const operationsList = []
const socketList = []
let numOfSockets = 1
let myTimeStamp = 0
let operationHistory = []

const threshold = 10 // will probably be 1 or 10 (can be anything > 0)
let server = null
// The local updates will be saved here
// When we reach the threshold size we send all the local updates to all other clients
// Then , we reset this list to be empty again
let localUpdates = []
const debugFlag = false

const fileName = process.argv[2]
const data = fs.readFileSync(fileName).toString()

const isWindowsOS = false
const delimiter = isWindowsOS ? '\r\n' : '\n' // on windows '\r\n' on unix/macosX '\n'
const lines = data.split(delimiter).filter((str) => str.length > 0)
const myId = parseInt(lines[0])
const port = lines[1]
let stringReplica = lines[2]
const originString = stringReplica
const configurations = lines.slice(3)
const operations = configurations.filter(line => line.startsWith("delete") || line.startsWith('insert'))
const clients = configurations.filter(line => !(line.startsWith("delete") || line.startsWith('insert')))
operations.forEach(operation => operationsList.push(operation))
const numOfOperations = operationsList.length
clients.forEach(client => {
    const clientConfiguration = client.split(' ')
    clientList.push({
        id: parseInt(clientConfiguration[0]),
        host: clientConfiguration[1],
        port: parseInt(clientConfiguration[2])
    })
})

let numOfReady = 0

let clientsConnectsToMe = clientList.filter((client) => client.id < myId).length
let maxId = myId
let minId = myId

const checkMinMaxId = (client) => {
    maxId = client.id > maxId ? client.id : maxId
    minId = client.id < minId ? client.id : minId
}

clientList.forEach(checkMinMaxId)
const imMax = maxId === myId
let maxSocket = null

const timeStampMap = new Map();

const updateTimeStampMap = (id, timeStampValue) => {
    timeStampMap.set(id, timeStampValue)
}

clientList.forEach(client => updateTimeStampMap(client.id, 0))
updateTimeStampMap(myId, 0)

let minTimeStamp = -1;

const log = (msg) => {
    console.log(`LOGGING INFO: ${msg}`)
}
const debug = (msg) => {
    if (debugFlag) {
        console.log(`DEBUG: ${msg}`)
    }
}

FgRed = "\x1b[31m"

const error = (msg) => {
    console.log(FgRed + `ERROR: ${msg}`)
}

const jsonToBuffer = (json) => {
    return Buffer.from(JSON.stringify(json) + "\n")
}

const writeToData = (socket, data) => {
    socket.write(data)
}

const writeStart = (socket) => {
    socket.write('start')
}

const writeReady = (socket) => {
    socket.write(`ready ${myId}`)
}

const writeGoodbye = (socket) => {
    socket.write(`goodbye ${myId}`)
}

/**
 * Receives an operation (local operation from the input file or update operation from another client)
 * and apply the required modification on the local copy of the string (stringReplica)
 * @param operation the operation to apply (example -> "insert x 8")
 */
const applyOperation = (operation) => {
    const action = operation !== undefined ? operation.split(' ') : ''
    const op = action[0]

    switch (op) {
        case "insert": {
            const char = action[1]
            const index = action.length === 3 ? parseInt(action[2]) : stringReplica.length
            const prefix = stringReplica.substr(0, index)
            const suffix = stringReplica.substr(index)
            updateStringReplica(prefix + char + suffix)
            return
        }
        case "delete": {
            const index = parseInt(action[1])
            const prefix = stringReplica.substr(0, index)
            const suffix = stringReplica.substr(index + 1)
            updateStringReplica(prefix + suffix)
            return
        }
        default: {
            // This should not happen
            error('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx oi vavoi XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

        }
    }
}

const eventLoop = async () => {
    /**
     * will be called only on the local operations.
     * 1. apply operation on the string
     * 2. increased finished operations
     * 3. increase my time stamp
     * 4. push to history the new operation which consists of: operation, myTimeStamp, stringReplice (after update), myId
     * 5. set new timestamp in timeStampMap for myId
     * 6. clear history if needed
     * 7. push new data to localUpdates
     * 8. check if finished all the local modifications
     * 9. check if needed to send update to clients
     * @param operation operation to handle
     * @returns {Promise<void>}
     */
    const handleOperation = async (operation) => {
        applyOperation(operation)
        finishedOperations++
        increaseMyTimeStamp()
        const timeStamp = myTimeStamp
        const id = myId
        operationHistory.push({operation: operation, timeStamp: timeStamp, updatedString: stringReplica, id: id})
        updateTimeStampMap(id, timeStamp)
        clearHistoryIfNeeded()
        const data = {operation, timeStamp, id}
        localUpdates.push(data)
        const finishedLocalStringModifications = (finishedOperations === numOfOperations)
        if (finishedLocalStringModifications) {
            log(`Client ${myId} finished his local string modifications`)
        }
        if (localUpdates.length === threshold || finishedLocalStringModifications) {
            sendAllSavedOperationsAndReset()
        }
    }

    let finishedOperations = 0
    operationsList.forEach(operation => {
        setTimeout(() => handleOperation(operation), Math.random() * 10000)
    })
}

/**
 * When the localUpdates list is full (exceeded threshold size) or we finished our local string modification
 * We will send all the saved local operations to all other clients and then reset this list
 *
 * Will be called only from handleOperation after the above condition was checked
 */
const sendAllSavedOperationsAndReset = () => {
    localUpdates.forEach(data => {
        socketList.forEach(socket => {
            writeToData(socket, jsonToBuffer(data))
        })
    })
    localUpdates = []
}

/**
 * enters this funciton ONLY when need to merge. We don't check here the condition to merge.
 *
 * 1. find the the index to insert the new action
 * 2. get the stringReplica to work on
 * 3. create an arrays of operation to perform, which is the new action, and all the operations with index greater that we found
 * 4. get the operationHistory below index
 * 5. go over all operations that we found in 3., apply them and add them to the operationHistory we found in 4
 *
 * @param action the new action to merge
 * @param timeStamp the new action timestamp
 * @param id the id of the sender
 */
const mergeAlgorithm = (action, timeStamp, id) => {
    let index = operationHistory.findIndex(operation => operation.timeStamp >= timeStamp)
    while (operationHistory[index].timeStamp === timeStamp) {
        if (id > operationHistory[index].id) {
            index++
        } else break
    }
    stringReplica = index !== 0 ? operationHistory[index - 1].updatedString : originString

    const operationsToPerform = [{
        operation: action,
        timeStamp: timeStamp,
        updatedString: stringReplica,
        id: id
    }].concat(operationHistory.slice(index))
    operationHistory = operationHistory.slice(0, index)
    log(`Client ${myId} started merging, from time stamp ${timeStamp}, on ${stringReplica}`)
    operationsToPerform.forEach(op => {
        applyOperation(op.operation)
        log(`operation (${op.operation}, ${op.timeStamp}), string: ${stringReplica}`)
        op.updatedString = stringReplica
        operationHistory.push(op)
    })
    log(`Client ${myId} ended merging with string ${stringReplica}, on timestamp ${operationHistory[operationHistory.length - 1].timeStamp}`)
}

const updateStringReplica = (newString) => {
    stringReplica = newString
}

/**
 * Handling received data from other client
 *
 * @param socket -> The socket that sent us the data to handle
 * @param data -> The data to handle. which may be one of the following options:
 * 1. Operation Data - meaning that we received an operation to perform on our stringReplica
 *      In that case we will be forwarded to _handleData function
 * 2. Ready data - meaning that a client that connected to me reported that he is ready
 *     Only the maxId should receive this 'Ready' data
 * 3. Goodbye - meaning that a client that connected to me is finished and notify that he is disconnecting from me
 * 4. Start - The max Id client is the only one that sends Start message. the Start message notifying all the other
 *    clients that everyone is ready to start. this message will triger the clients to stary applying modifications
 *    on the string
 */
const handleData = (socket, data) => {
    /**
     * Will only be called from handleData, and only when the data is operation data
     * Handle string modification data
     * Will handle the following:
     * 1. apply modifications on the stringReplica
     * 2. will apply the merge algorithm in case that is needed
     * 3. will update the timeStamp map
     *
     * @param operation - operation to perform on the stringReplica
     * @private
     */
    const _handleData = (operation) => {
        const parsedData = JSON.parse(operation)
        const timeStamp = parsedData['timeStamp']
        const action = parsedData['operation']
        const id = parsedData['id']

        log(`Client ${myId} received an update operation (${action}, ${timeStamp}) from client ${id}`)
        myTimeStamp = Math.max(myTimeStamp, timeStamp)
        increaseMyTimeStamp()
        const lastOperation = operationHistory[operationHistory.length - 1]
        if (lastOperation !== undefined &&
            (timeStamp < lastOperation.timeStamp ||
                (timeStamp === lastOperation.timeStamp && lastOperation.id > id))) {
            mergeAlgorithm(action, timeStamp, id)
        } else {
            applyOperation(action)
            operationHistory.push({operation: action, timeStamp: timeStamp, updatedString: stringReplica, id: id})
        }

        updateTimeStampMap(parseInt(id), parseInt(timeStamp))
        clearHistoryIfNeeded()
    } // end _handleData

    const stringData = data.toString()

    // goodbye data
    if (stringData.startsWith("goodbye")) {
        handleGoodbye()
        return
    }

    // goodbye data
    if (stringData.startsWith("ready")) {
        handleReady()
        return
    }

    // start data
    if (stringData.startsWith("start")) {
        start()
        return
    }
    data = stringData.split('\n').filter((str) => str.length > 0)

    // operation(s) data
    data.map(_handleData)
} // end handleData

/**
 * Updates the minimum timeStamp for the clients
 * checking if it is changed and return accordingly
 *
 * @returns {boolean} pointing if the minimum has changed
 */
const updateMinTimeStampAndNotifyIfChanged = () => {
    let changed = false

    // find min timestamp in map
    let minTimeStampInMap = myTimeStamp
    for (let value of timeStampMap.values()) {
        if (value < minTimeStampInMap)
            minTimeStampInMap = value
    }

    // check if is bigger then the current minimum known timeStamp
    if (minTimeStampInMap > minTimeStamp) {
        minTimeStamp = minTimeStampInMap
        changed = true
    }
    return changed
}

/**
 * Updates the minimum timeStamp for all clients and check if it changed.
 * If so, cleaning some useless data in operationHistory
 */
const clearHistoryIfNeeded = () => {
    const needToClear = updateMinTimeStampAndNotifyIfChanged()
    if (needToClear) {
        cleanOperationHistory()
    }
}

/**
 * will be called only from clearHistoryIfNeeded
 * removes all operations that are no longer needed in the operationHistory list
 */
const cleanOperationHistory = () => {
    operationHistory = operationHistory.filter(op => {
        const needToKeepOp = op.timeStamp >= minTimeStamp
        if (!needToKeepOp) {
            log(`Client ${myId} removed operation (${op.operation},${op.timeStamp}) from storage`)
        }
        return needToKeepOp
    })
}

const handleEnd = (socket) => {
    debug(`Closing connection with client ${socket}`)
}

const handleError = (err, msg = null) => {
    if (msg) {
        error(msg)
    }
    error(e.stack)
    error(e.name)
    error(e.message)
}

const decreaseNumOfSockets = () => {
    numOfSockets--
}

const decreaseClientsConnection = () => {
    clientsConnectsToMe--
}

/**
 * checks if it was the last client that I am waiting for. If it is, and I am not the maxId, then send that I'm ready to
 * run to the maxSocket
 */
const checkLastClientConnect = () => {
    if (clientsConnectsToMe === 0 && !imMax) {
        debug(`${myId} is ready`)
        writeReady(maxSocket)
    }
}

const addSocketToList = (socket) => {
    socketList.push(socket)
}

const increaseNumOfSockets = () => {
    numOfSockets++
}

const increaseMyTimeStamp = () => {
    myTimeStamp++
}

const increaseNumOfReady = () => {
    numOfReady++
}

/**
 * we need to remember that we are waiting to all the clients with id lower than me to connect to me before
 * we send 'ready' to the maxId. Also we remember how many sockets we currently have and add the socket to socketList
 * 1. decreases the number of clients that we are waiting to conenct to us
 * 2. check if it was the last client we are waiting for
 * 3. increase numOfSockets that are connected to me
 * 4. add socekt to socketList
 * 5. register to events: 'data', 'end' and 'error' (the only events that module net of node supports. Don't add events!)
 * @param socket the socket that connected to me
 */
const handleServerConnection = (socket) => {
    decreaseClientsConnection();

    checkLastClientConnect()

    increaseNumOfSockets()

    addSocketToList(socket)

    socket.on('data', (data) => {
        handleData(socket, data)
    })

    socket.on('end', () => handleEnd(socket))

    socket.on('error', handleError);
}

/**
 * creates a server of 'net' module and saves it in the 'server' global variables
 * make the server listen on the port that was given and parsed from the txt file
 * register to a 'connection' event.
 */
const createServer = () => {
    server = new net.Server()
    server.listen(port, () => debug(`hello world on port ${port}`))
    server.on('connection', handleServerConnection)
}


/**
 * handle the 'ready' event.
 * only the highest id client should get this event.
 * increases the number of ready
 * checks if all clients are ready, if they are sending start to all the clients, and starting myself
 */
const handleReady = () => {
    debug(`Client ${myId} is ready`)
    increaseNumOfReady()

    if (numOfReady === clientList.length) {
        socketList.forEach(writeStart)
        start()
    }
}

/**
 * decreases the num of sockets that the client is connected to,
 * and if it was the last one it kills the connection with all the sockets and ends.
 * closes the server before exiting
 */
const handleGoodbye = () => {
    decreaseNumOfSockets()
    if (numOfSockets === 0) {
        socketList.forEach(socket => socket.end())
        debug(`final string: ${stringReplica}`)
        log(`Client ${myId} is exiting`)
        server.close()
        process.exit(0)
    }
}

/**
 * sends goodbye to all of the sockets.
 * activates handleGoodbye to decrease the initial value
 * @returns {Promise<void>}
 */
const goodbye = async () => {
    socketList.forEach(writeGoodbye)
    handleGoodbye()
}

/**
 * creates a connection to the server using the net module
 * @param port the port to connect to
 * @param host the host to connect to
 * @param callback the callback to perform after connection successful
 * @returns {Socket} the socket of the server that was connected to at host:port
 */
const createConnection = (port, host, callback) => {
    return net.createConnection(port, host, callback)
}

/**
 * handles the error event when recieving from clients
 * @param err
 */
const handleClientError = (err, id) => {
    handleError(err, `got error on client id ${id} port ${port}`)
}


/**
 * updates the maxSocket to be the socket that is given.
 * This function assumes that the socket it is given is the socket of the client
 * with the highest id
 * also sends ready if it is the client with the lowest id
 * @param socket the socket to be max socket
 */
const updateMaxSocket = (socket) => {
    maxSocket = socket
    if (minId === myId) {
        writeReady(socket)
        debug(`${myId} ready`)
    }
}

/**
 * connects to the server of client id ant host:port.
 *
 * @param id the id of the client to connect
 * @param host the host of the client
 * @param port the port of the client
 */
const connectToServer = (id, host, port) => {

    let socket = undefined;

    socket = createConnection(port, host, () => debug(`Connected to client ${host}:${port}`))

    socket.on('data', (data) => {
        handleData(socket, data)
    })

    socket.on('error', (err) => handleClientError(err, id))

    socket.on('end', () => debug('closing connection with client ', id))

    increaseNumOfSockets()

    addSocketToList(socket)

    const isMaxId = maxId === id

    if (isMaxId) {
        updateMaxSocket(socket)
    }
}

/**
 * connect to all the clients that are in the client list
 * @param clientList the list of clients to connect
 */
const connectClients = (clientList) => {
    clientList.forEach(({id, host, port}) => {
        // connect only to the servers of the Id's bigger than me
        if (myId < id) {
            connectToServer(id, host, port)
        }
    })
}


/**
 * main function, starts the event loop after 10 seconds and the goodbye after 30 seconds
 */
const start = () => {
    debug(`${myId} starts`)
    setTimeout(eventLoop, 10000)
    setTimeout(goodbye, 30000)
}

createServer()

connectClients(clientList)

