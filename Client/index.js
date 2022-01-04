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
clients.forEach(client => {
    const clientConfiguration = client.split(' ')
    clientList.push({
        id: parseInt(clientConfiguration[0]),
        host: clientConfiguration[1],
        port: parseInt(clientConfiguration[2])
    })
})

const log = (msg) => {
    console.log(`LOGGING INFO: ${msg}`)
}
const debug = (msg) => {
    console.log(`DEBUG: ${msg}`)
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

    if (data.toString().startsWith("goodbye")) {
        handleGoodbye()
        return
    }
    data = data.toString().split('\n').filter((str) => str.length > 0)
    data.map(_handleData)
}

const createServer = (server) => {
    server.listen(port, () => console.log(`hello world on port ${port}`))

    server.on('connection', (socket) => {
        numOfSockets++;
        socketList.push(socket)
        console.log(`a new connection from socket ${socket}`)
        operationHistory.forEach(({operation, timeStamp, stringReplica, id}) => {
            if(id === myId){
                const data = {operation, timeStamp, id}
                socket.write(Buffer.from(JSON.stringify(data) + "\n"))
            }
        })
        socket.on('data', (data) => {
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
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx oi vavoi XXXXXXXXXXXXXXXXXX')

        }
    }
}

const eventLoop = async () => {
    const handleOperation = async (operation) => {
        applyOperation(operation)
        myTimeStamp++
        const timeStamp = myTimeStamp
        const id = myId
        operationHistory.push({operation: operation, timeStamp: timeStamp, updatedString: stringReplica, id: id})
        const data = {operation, timeStamp, id}

        socketList.forEach(socket => socket.write(Buffer.from(JSON.stringify(data) + "\n")))
    }

    operationsList.forEach(operation => setTimeout(() => handleOperation(operation), Math.random() * 10000))
}

const handleGoodbye = () => {
    numOfSockets--
    if (numOfSockets === 0) {
        socketList.forEach(socket => socket.end())
        console.log(`final string: ${stringReplica}`)
        log(`Client ${myId} is exiting`)
        process.exit(0)
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
        let socket = undefined;
        socket = net.createConnection(port, host, () => console.log(`Connected to client ${host}:${port}`))
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

setTimeout(goodbye, 30000)
