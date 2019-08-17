const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

mongo.connect('mongodb://127.0.0.1/mongochat',{ useNewUrlParser: true },(err,db) => {
    if(err){
        throw err;
    }
    console.log('MongoDB connected...');

    client.on('connection',(socket) => {

        let chat = db.db('mongochat').collection('chats');
        sendStatus = (s) => {
            socket.emit('status',s);
        }

        chat.find().limit(100).sort({_id:1}).toArray((err,res) => {
            if(err){
                throw err;
            }
            socket.emit('output',res);
        });

        socket.on('input',(data) => {
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                sendStatus('Please enter a name and message');
            } else {
                chat.insert({name: name,message: message}, () => {
                    client.emit('output',[data]);

                    sendStatus({
                        message: 'Message sent',
                        clear:true
                    });
                });
            }
        });

    socket.on('clear',(data) => {
        chat.remove({}, () => {
            socket.emit('cleared');
        });
    });        
    });
});


