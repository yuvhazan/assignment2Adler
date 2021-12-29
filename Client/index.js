const net = require('net')
const fs = require('fs')
const clientList = []
const operationsList = []
const socketList = []
let numOfSockets = 1
let myTimeStamp = 0
const operationHistory = []
const server = new net.Server()

const fileName = process.argv[2]
const data = fs.readFileSync(fileName).toString()
const lines = data.split('\r\n').filter((str) => str.length > 0)
console.log(lines)

const myId = lines[0]
const port = lines[1]
let stringReplica = lines[2]
const configurations = lines.slice(3)
const operations = configurations.filter(line => line.startsWith("delete") || line.startsWith('insert'))
const clients = configurations.filter(line => !(line.startsWith("delete") || line.startsWith('insert')))
console.log(clients)
console.log(operations)
operations.forEach(operation => operationsList.push(operation))
clients.forEach(client => {
    const clientConfiguration = client.split(' ')
    clientList.push({
        id: parseInt(clientConfiguration[0]),
        host: clientConfiguration[1],
        port: parseInt(clientConfiguration[2])
    })
})

const mergeAlgorithm = (action, timeStamp, id) => {

}

const updateStringReplica = (newString) => {
    console.log(`before ${stringReplica}`)
    stringReplica = newString
    console.log(`after ${stringReplica}`)
}

const handleData = (socket, data) => {
    if (data.toString().startsWith("goodbye")) {
        handleGoodbye()
        return
    }
    const parsedData = JSON.parse(data)
    const timeStamp = parsedData['myTimeStamp']
    const action = parsedData['operation']
    const id = parsedData['myId']
    console.log(JSON.parse(data))
    console.log(`myTimeStamp = ${myTimeStamp}`)
    console.log(`timeStamp = ${timeStamp}`)
    myTimeStamp = Math.max(myTimeStamp, timeStamp)
    myTimeStamp++
    const lastOperation = operationHistory[operationHistory.length-1]
    if (lastOperation !== undefined &&
        timeStamp < lastOperation.timeStamp ||
        (timeStamp === lastOperation.timeStamp && myId < id)) {
        mergeAlgorithm(action, timeStamp, id)
    } else {
        console.log('action', action)
        applyOperation(action)
        operationHistory.push({operation: action, timeStamp: timeStamp, updatedString: stringReplica})
    }
}

const createServer = (server) => {
    server.listen(port, () => console.log(`hello world on port ${port}`))

    server.on('connection', (socket) => {
        numOfSockets++;
        socketList.push(socket)
        console.log(`a new connection from socket ${socket}`)

        socket.on('data', (data) => {
            console.log(`Data received from client: ${data.toString()}`)
            handleData(socket, data)
        })

        socket.on('end', () => {
            console.log(`Closing connection with the client ${socket}`)
        })

        socket.on('error', (err) => {
            console.log(`Error: ${err}`);
            console.log(err.stack)
        });
    })
}

const applyOperation = (operation) => {
    console.log(`operation = ${operation}`)
    const action = operation !== undefined ? operation.split(' ') : ''
    const op = action[0]

    console.log(`op = ${op}`)

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
        applyOperation(operation)
        console.log(`myTimeStamp = ${myTimeStamp}`)
        myTimeStamp++
        operationHistory.push({operation: operation, timeStamp: myTimeStamp, updatedString: stringReplica})
        const data = {operation, myTimeStamp, myId}
        socketList.forEach(socket => socket.write(Buffer.from(JSON.stringify(data))))
    }

    operationsList.forEach(operation => setTimeout(() => handleOperation(operation), 1000))
}

const handleGoodbye = () => {
    numOfSockets--
    if (numOfSockets === 0) {
        socketList.forEach(socket => socket.end())
        console.log(`final string: ${stringReplica}`)
    }
}


const goodbye = async () => {
    socketList.forEach(socket => {
        socket.write(`goodbye ${myId}`)
    })
    handleGoodbye()
}

createServer(server)

clientList.forEach(({id, host, port}) => {
    if (myId < id) {
        const socket = net.createConnection(port, host, () => console.log(`Connected to client ${host}:${port}`))
        socket.on('data', (data) => {
            handleData(socket, data)
        })
        socket.on('error', (err) => {
            console.log(`got error on client id ${id} port ${port} error: ${err.toString()}`)
        })
        socket.on('end', () => console.log('closing connection with client ', id))
        numOfSockets++;
        socketList.push(socket)
    }
})

setTimeout(eventLoop, 10000)

setTimeout(goodbye, 20000)
