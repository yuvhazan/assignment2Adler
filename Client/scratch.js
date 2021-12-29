let x = [
    { operation: 'delete 1', timeStamp: 1, updatedString: 'ac', id: '3' },
    {
        operation: 'insert d',
        timeStamp: 2,
        updatedString: 'acd',
        id: '3'
    },
    {
        operation: 'insert f',
        timeStamp: 3,
        updatedString: 'acdf',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 4,
        updatedString: 'acdfd',
        id: '3'
    },
    {
        operation: 'delete 3',
        timeStamp: 5,
        updatedString: 'acdd',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 6,
        updatedString: 'acddd',
        id: '3'
    },
    {
        operation: 'insert e',
        timeStamp: 7,
        updatedString: 'acddde',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 9,
        updatedString: 'acddded',
        id: '2'
    },
    {
        operation: 'delete 1',
        timeStamp: 10,
        updatedString: 'addded',
        id: '2'
    },
    {
        operation: 'delete 1',
        timeStamp: 12,
        updatedString: 'added',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 13,
        updatedString: 'azdded',
        id: '3'
    },
    {
        operation: 'insert f',
        timeStamp: 15,
        updatedString: 'azddedf',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 17,
        updatedString: 'azzddedf',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 19,
        updatedString: 'azzddedfd',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 20,
        updatedString: 'azzddedfdd',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 21,
        updatedString: 'azzzddedfdd',
        id: '2'
    },
    {
        operation: 'insert x 3',
        timeStamp: 23,
        updatedString: 'azzxzddedfdd',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 24,
        updatedString: 'azzxzddedfddd',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 25,
        updatedString: 'azzxzddedfdddd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 26,
        updatedString: 'azxzddedfdddd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 27,
        updatedString: 'axzddedfdddd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 28,
        updatedString: 'azddedfdddd',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 29,
        updatedString: 'azddedfddddd',
        id: '3'
    },
    {
        operation: 'insert f',
        timeStamp: 31,
        updatedString: 'azddedfdddddf',
        id: '1'
    },
    {
        operation: 'delete 1',
        timeStamp: 32,
        updatedString: 'addedfdddddf',
        id: '1'
    },
    {
        operation: 'delete 1',
        timeStamp: 34,
        updatedString: 'adedfdddddf',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 36,
        updatedString: 'adedfdddddfd',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 38,
        updatedString: 'azdedfdddddfd',
        id: '3'
    },
    {
        operation: 'delete 3',
        timeStamp: 39,
        updatedString: 'azddfdddddfd',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 41,
        updatedString: 'azzddfdddddfd',
        id: '2'
    },
    {
        operation: 'delete 3',
        timeStamp: 43,
        updatedString: 'azzdfdddddfd',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 45,
        updatedString: 'azzzdfdddddfd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 46,
        updatedString: 'azzdfdddddfd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 48,
        updatedString: 'azdfdddddfd',
        id: '1'
    },
    {
        operation: 'insert d',
        timeStamp: 49,
        updatedString: 'azdfdddddfdd',
        id: '1'
    },
    {
        operation: 'insert f',
        timeStamp: 51,
        updatedString: 'azdfdddddfddf',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 53,
        updatedString: 'adfdddddfddf',
        id: '2'
    },
    {
        operation: 'delete 3',
        timeStamp: 54,
        updatedString: 'adfddddfddf',
        id: '2'
    },
    {
        operation: 'insert y 2',
        timeStamp: 55,
        updatedString: 'adyfddddfddf',
        id: '2'
    },
    {
        operation: 'insert f',
        timeStamp: 57,
        updatedString: 'adyfddddfddff',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 58,
        updatedString: 'adyfddddfddffd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 60,
        updatedString: 'ayfddddfddffd',
        id: '2'
    },
    {
        operation: 'insert x 3',
        timeStamp: 62,
        updatedString: 'ayfxddddfddffd',
        id: '3'
    },
    {
        operation: 'insert f',
        timeStamp: 64,
        updatedString: 'ayfxddddfddffdf',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 65,
        updatedString: 'azyfxddddfddffdf',
        id: '1'
    },
    {
        operation: 'delete 1',
        timeStamp: 67,
        updatedString: 'ayfxddddfddffdf',
        id: '3'
    },
    {
        operation: 'delete 3',
        timeStamp: 69,
        updatedString: 'ayfddddfddffdf',
        id: '2'
    },
    {
        operation: 'insert y 2',
        timeStamp: 71,
        updatedString: 'ayyfddddfddffdf',
        id: '3'
    },
    {
        operation: 'insert x 3',
        timeStamp: 73,
        updatedString: 'ayyxfddddfddffdf',
        id: '2'
    },
    {
        operation: 'delete 2',
        timeStamp: 75,
        updatedString: 'ayxfddddfddffdf',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 77,
        updatedString: 'azyxfddddfddffdf',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 79,
        updatedString: 'azzyxfddddfddffdf',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 81,
        updatedString: 'azyxfddddfddffdf',
        id: '1'
    },
    {
        operation: 'insert y 2',
        timeStamp: 82,
        updatedString: 'azyyxfddddfddffdf',
        id: '1'
    },
    {
        operation: 'insert f',
        timeStamp: 84,
        updatedString: 'azyyxfddddfddffdff',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 85,
        updatedString: 'azzyyxfddddfddffdff',
        id: '3'
    },
    {
        operation: 'insert x 3',
        timeStamp: 86,
        updatedString: 'azzxyyxfddddfddffdff',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 88,
        updatedString: 'azxyyxfddddfddffdff',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 89,
        updatedString: 'azzxyyxfddddfddffdff',
        id: '2'
    },
    {
        operation: 'delete 3',
        timeStamp: 90,
        updatedString: 'azzyyxfddddfddffdff',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 92,
        updatedString: 'azzzyyxfddddfddffdff',
        id: '1'
    },
    {
        operation: 'delete 1',
        timeStamp: 94,
        updatedString: 'azzyyxfddddfddffdff',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 96,
        updatedString: 'azzzyyxfddddfddffdff',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 98,
        updatedString: 'azzzyyxfddddfddffdffd',
        id: '1'
    },
    {
        operation: 'insert d',
        timeStamp: 100,
        updatedString: 'azzzyyxfddddfddffdffdd',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 101,
        updatedString: 'azzzyyxfddddfddffdffddd',
        id: '2'
    },
    {
        operation: 'insert e',
        timeStamp: 102,
        updatedString: 'azzzyyxfddddfddffdffddde',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 104,
        updatedString: 'azzzzyyxfddddfddffdffddde',
        id: '1'
    },
    {
        operation: 'delete 1',
        timeStamp: 106,
        updatedString: 'azzzyyxfddddfddffdffddde',
        id: '2'
    },
    {
        operation: 'delete 1',
        timeStamp: 107,
        updatedString: 'azzyyxfddddfddffdffddde',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 108,
        updatedString: 'azzzyyxfddddfddffdffddde',
        id: '2'
    },
    {
        operation: 'insert x 3',
        timeStamp: 109,
        updatedString: 'azzxzyyxfddddfddffdffddde',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 112,
        updatedString: 'azzzxzyyxfddddfddffdffddde',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 113,
        updatedString: 'azzzzxzyyxfddddfddffdffddde',
        id: '3'
    },
    {
        operation: 'insert x 3',
        timeStamp: 114,
        updatedString: 'azzxzzxzyyxfddddfddffdffddde',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 116,
        updatedString: 'azzxzzxzyyxfddddfddffdffddded',
        id: '2'
    },
    {
        operation: 'insert z 1',
        timeStamp: 118,
        updatedString: 'azzzxzzxzyyxfddddfddffdffddded',
        id: '1'
    },
    {
        operation: 'insert f',
        timeStamp: 119,
        updatedString: 'azzzxzzxzyyxfddddfddffdffdddedf',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 120,
        updatedString: 'azzzzxzzxzyyxfddddfddffdffdddedf',
        id: '1'
    },
    {
        operation: 'insert d',
        timeStamp: 122,
        updatedString: 'azzzzxzzxzyyxfddddfddffdffdddedfd',
        id: '3'
    },
    {
        operation: 'delete 3',
        timeStamp: 124,
        updatedString: 'azzzxzzxzyyxfddddfddffdffdddedfd',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 125,
        updatedString: 'azzzxzzxzyyxfddddfddffdffdddedfdd',
        id: '2'
    },
    {
        operation: 'insert x 3',
        timeStamp: 127,
        updatedString: 'azzxzxzzxzyyxfddddfddffdffdddedfdd',
        id: '1'
    },
    {
        operation: 'insert z 1',
        timeStamp: 129,
        updatedString: 'azzzxzxzzxzyyxfddddfddffdffdddedfdd',
        id: '3'
    },
    {
        operation: 'delete 1',
        timeStamp: 131,
        updatedString: 'azzxzxzzxzyyxfddddfddffdffdddedfdd',
        id: '2'
    },
    {
        operation: 'delete 3',
        timeStamp: 133,
        updatedString: 'azzzxzzxzyyxfddddfddffdffdddedfdd',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 135,
        updatedString: 'azzzzxzzxzyyxfddddfddffdffdddedfdd',
        id: '2'
    },
    {
        operation: 'insert d',
        timeStamp: 136,
        updatedString: 'azzzzxzzxzyyxfddddfddffdffdddedfddd',
        id: '2'
    },
    {
        operation: 'insert x 3',
        timeStamp: 137,
        updatedString: 'azzxzzxzzxzyyxfddddfddffdffdddedfddd',
        id: '2'
    },
    {
        operation: 'delete 1',
        timeStamp: 139,
        updatedString: 'azxzzxzzxzyyxfddddfddffdffdddedfddd',
        id: '3'
    },
    {
        operation: 'insert d',
        timeStamp: 140,
        updatedString: 'azxzzxzzxzyyxfddddfddffdffdddedfdddd',
        id: '3'
    },
    {
        operation: 'insert z 1',
        timeStamp: 142,
        updatedString: 'azzxzzxzzxzyyxfddddfddffdffdddedfdddd',
        id: '1'
    }
]
let timeStamp = 142
let index = x.findIndex(operation => operation.timeStamp >= timeStamp)
console.log(index)
console.log(x[index].timeStamp)

let x = "azzxzyxyzxxdddddedfedddfffddddfdeddedddefddfddeddddddffdddfffddfdfdfdddddffdfddfddffddf"