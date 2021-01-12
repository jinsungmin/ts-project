import { app } from './app';
import * as http from 'http';
import * as mongoose from 'mongoose';

const PORT = 8080;
const MONGO_URI = 'mongodb://localhost:27017/chess';
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

server.listen(PORT);

const { addUser, removeUser, getUser, users } = require('./users');
const { addRoom, removeRoom, getRoom, getIndex, removeUserInRoom, rooms } = require('./rooms');

io.on('connection', (socket) => {
	socket.on('login', (name, callback) => {
    console.log('login-user:', name);
    let exist = 0;
    for(let i = 0; i< users.length; i++) {
      if(name === users[i].name) {
        exist++;
      }
    }
    if(exist === 0) {
      const {error, user } = addUser({id: socket.id, name: name});
      console.log('We have a new connection.');
      if(error) return callback(error);
    } else {
      const {error, user } = addUser({id: socket.id, name});
      if(error) return callback(error);
    }

    console.log('users:',users);
    console.log('total user count:', users.length);
    socket.emit('sendRoom', {rooms: rooms});
    socket.emit('sendUser', {users: users});
	})
	
	socket.on('getRoomList', () => {
		console.log('usersss:', users);
		if (users.length !== 0) {
      socket.emit('sendRoom', { users: users });
    }
		/*
		for(let i = 0; i< users.length; i++) {
			io.to(user.room).emit('message', { user: user.name, text: message});
		}
		*/
  });

  socket.on('requestMatch', ({fromUser, toUser, confirm}, callback) => {
    try {
      console.log('request Match');
      if(confirm === 'send') {
        io.to(getUser(toUser).id).emit('request', {fromUser: fromUser, confirm: 'receive'});
      } else if(confirm === 'receive'){
        io.to(getUser(toUser).id).emit('request', {fromUser: fromUser, confirm: 'start'});
      }
    } catch (error) {
      return callback(error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('disconnected!');
    
    const user = removeUser(socket.id);
    if(user !== -1) {
      socket.emit('sendUser', {users: users});
    }
  })
});

server.on('listening', async () => {
	console.info(`listening on port ${PORT}`);
	mongoose.connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false });
	mongoose.connection.on('open', () => {
		console.info('Connected to Mongo.');
	});
	mongoose.connection.on('error', (err: any) => {
		console.error(err);
	});
});