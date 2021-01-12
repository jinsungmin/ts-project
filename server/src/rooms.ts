const rooms = [];

const addRoom = ( {id, name, room }) => {
  // JavaScript Mastery = javascriptmastery
  console.log('data:', id, name, room);
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  for(let i = 0; i < rooms.length; i++) {
    if(room === rooms[i].room) {
      rooms[i].name.push(name);
      rooms[i].id.push(id);

      const gameRoom = rooms[i];

      return { gameRoom }
    }
  }

  const gameRoom = { id:[id], name:[name], room };

  rooms.push(gameRoom);

  return { gameRoom }
}

const removeUserInRoom = (name) => {
  for(let i = 0; i< rooms.length; i++) {
    for(let j = 0; j < rooms[i].name.length; j++) {
      if(name === rooms[i].name[j]) {
        rooms[i].name.splice(j, 1);
        rooms[i].id.splice(j, 1);

        return rooms[i];
      }
    }
  }
  return -1;
}

const removeRoom = (room) => {
  const index = rooms.findIndex((gameRoom) => gameRoom.room === room);

  if(index !== -1) {
    rooms.splice(index, 1)[0];
  }
}

const getRoom = (id) => {
  for(let i = 0; i< rooms.length; i++) {
    for(let j = 0; j < rooms[i].id.length; j++) {
      if(id === rooms[i].id[j])
        return rooms[i];
    }
  }
}

const getIndex = (id) => {
  for(let i = 0; i< rooms.length; i++) {
    for(let j = 0; j < rooms[i].id.length; j++) {
      if(id === rooms[i].id[j])
        return j;
    }
  }
}

//const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addRoom, removeRoom, getRoom, getIndex,removeUserInRoom, rooms }