db = db.getSiblingDB('mydb');
db.users.insertMany([
    {
        name: "user1",
    },
    {
        name: "user2",
    },
    {
        name: "user3",
    }
]);