const net = require('net')
const fs = require('fs')
const clientList = []
const operationsList = []
const socketList = []
let numOfSockets = 1
let myTimeStamp = 0
let operationHistory = []
const server = new net.Server()

const fileName = process.argv[2]
const tenOperation = false
const data = fs.readFileSync(fileName).toString()
const lines = data.split('\n').filter((str) => str.length > 0)
const myId = lines[0]
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
// TODO: I added this one because it can help us with the condition when we
//  need to know if we are the minimum id
let minId = myId

const checkMinMaxId = (client) => {
    maxId = client.id ? client.id > maxId : maxId
    minId = client.id ? client.id < minId : minId
}

clientList.forEach(checkMinMaxId)

const imMax = maxId === myId
let maxSocket = null

const log = (msg) => {
    console.log(`LOGGING INFO: ${msg}`)
}
const debug = (msg) => {
    console.log(`DEBUG: ${msg}`)
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


const applyOperation = (operation) => {
    const action = operation !== undefined ? operation.split(' ') : ''
    const op = action[0]
    debug('in apply operation')
    console.log(operation)

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
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx oi vavoi XXXXXXXXXXXXXXXXXX')

        }
    }
}

const eventLoop = async () => {
    const handleOperation = async (operation) => {
        console.log(operation)
        applyOperation(operation)
        finishedOperations++
        if(finishedOperations === numOfOperations){
            log(`Client ${myId} finished his local string modifications`)
        }
        myTimeStamp++
        const timeStamp = myTimeStamp
        const id = myId
        operationHistory.push({operation: operation, timeStamp: timeStamp, updatedString: stringReplica, id: id})
        const data = {operation, timeStamp, id}
        socketList.forEach(socket => writeToData(socket, jsonToBuffer(data)))
    }

    let finishedOperations = 0
    console.log(operationsList)
    operationsList.forEach(operation => {
        console.log(operation)
        setTimeout(() => handleOperation(operation), Math.random() * 10000)
    })
}

const mergeAlgorithm = (action, timeStamp, id) => {
    let index = operationHistory.findIndex(operation => operation.timeStamp >= timeStamp)
    while (operationHistory[index].timeStamp === timeStamp) {
        if (id > operationHistory[index].id) {
            index++
        }
        else break
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
        debug('in merge algorithm')
        console.log(op)
        debug('merge finish finish')
        applyOperation(op.operation)
        log(`operation (${op.operation}, ${op.timeStamp}), string: ${stringReplica}`)
        op.updatedString = stringReplica
        operationHistory.push(op)
    })
    log(`Client ${myId} ended merging with string ${stringReplica}, on timestamp ${operationHistory[operationHistory.length - 1].timeStamp}
`)
}

const updateStringReplica = (newString) => {
    log(`before change ${stringReplica}`)
    stringReplica = newString
    log(`after change ${stringReplica}`)
}

const handleData = (socket, data) => {
    const _handleData = (operation) => {
        const parsedData = JSON.parse(operation)
        const timeStamp = parsedData['timeStamp']
        const action = parsedData['operation']
        const id = parsedData['id']
        debug('before')
        console.log(parsedData)
        console.log(data.toString())
        log(`Client ${myId} received an update operation (${action}, ${timeStamp}) from client ${id}`)
        myTimeStamp = Math.max(myTimeStamp, timeStamp)
        myTimeStamp++
        const lastOperation = operationHistory[operationHistory.length - 1]
        if (lastOperation !== undefined &&
            (timeStamp < lastOperation.timeStamp ||
                (timeStamp === lastOperation.timeStamp && lastOperation.id > id))) {
            mergeAlgorithm(action, timeStamp, id)
        } else {
            applyOperation(action)
            operationHistory.push({operation: action, timeStamp: timeStamp, updatedString: stringReplica, id: id})
        }
    }

    const stringData = data.toString()

    if (stringData.startsWith("goodbye")) {
        handleGoodbye()
        return
    }
    if (stringData.startsWith("ready")) {
        handleReady()
        return
    }
    if (stringData.startsWith("start")) {
        start()
        return
    }
    data = stringData.split('\n').filter((str) => str.length > 0)
    data.map(_handleData)
}

const handleEnd = () => {
    console.log(`Closing connection with client ${socket}`)
}

const handleError = (err, msg=null) => {
    if (msg){
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

const checkLastClientConnect = () => {
    if (clientsConnectsToMe === 0){
        if(imMax){
            // TODO: check what to do if it is the last connection of the max ID
        }else{
            debug(`${myId} is ready`)
            writeReady(maxSocket)
        }
    }
}

const addSocketToList = (socket) => {
    socketList.push(socket)
}

const increaseNumOfSockets = () => {
    numOfSockets++
}

const increaseNumOfReady = () => {
    numOfReady++
}

const handleServerConnection = (socket) => {
    decreaseClientsConnection();

    checkLastClientConnect()

    increaseNumOfSockets()

    addSocketToList(socket)

    socket.on('data', (data) => {
        handleData(socket, data)
    })

    socket.on('start',start)

    socket.on('end', handleEnd)

    socket.on('error', handleError);
}

const createServer = (server) => {
    server.listen(port, () => console.log(`hello world on port ${port}`))
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

    if(numOfReady === clientList.length){
        socketList.forEach(writeStart)
        start()
    }
}

/**
 * decreases the num of sockets that the client is connected to,
 * and if it was the last one it kills the connection with all the sockets and ends
 */
//TODO: check if there is a problem that I'm ending the connection only after all of my connections ended
const handleGoodbye = () => {
    decreaseNumOfSockets()

    if (numOfSockets === 0) {
        socketList.forEach(socket => socket.end())
        log(`final string: ${stringReplica}`)
        log(`Client ${myId} is exiting`)
        //TODO: remove the print after finish debugging
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
const handleClientError = (err) => {
    handleError(err, `got error on client id ${id} port ${port}`)
}

/**
 * returns if the id is the maxId and that the client is the one with max Id
 * @param id id to check
 * @returns {boolean} true if id is the maxId and the client is the maxId
 */
//TODO: check if there is an option that the imMax will be true when calling it from connectToServer
const checkMaxId = (id) => !imMax && maxId === id


/**
 * updates the maxSocket to be the socket that is given.
 * This function assumes that the socket it is given is the socket of the client
 * with the highest id
 * also sends ready if it is the client with the lowest id
 * @param socket the socket to be max socket
 */
const updateMaxSocket = (socket) => {
    maxSocket = socket
    // TODO: what is this if? checks if im the lowest one?
    if(clientsConnectsToMe === 0) {
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

    socket = createConnection(port, host, () => console.log(`Connected to client ${host}:${port}`))

    socket.on('data', (data) => {
        handleData(socket, data)
    })

    socket.on('error', handleClientError)

    socket.on('end', () => console.log('closing connection with client ', id))

    increaseNumOfSockets()

    addSocketToList(socket)

    const isMaxId = checkMaxId(id)

    if(isMaxId){
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
    setTimeout(eventLoop, 10000)
    setTimeout(goodbye, 30000)
}

createServer(server)

connectClients(clientList)

