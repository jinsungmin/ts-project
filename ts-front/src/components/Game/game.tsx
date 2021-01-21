import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import Cell from './cell';

import io from 'socket.io-client';
import queryString from 'query-string';

import {
  Button,
} from "react-bootstrap";

import useObjects from '../../hooks/useObjects';
import useAddObject from '../../hooks/useAddObject';
import useChangeObject from '../../hooks/useChangeObject';

import black_king from '../../images/black_king.png';
import black_queen from '../../images/black_queen.png';
import black_rook from '../../images/black_rook.png';
import black_knight from '../../images/black_knight.png';
import black_bishop from '../../images/black_bishop.png';
import black_pawn from '../../images/black_pawn.png';

import white_king from '../../images/white_king.png';
import white_queen from '../../images/white_queen.png';
import white_rook from '../../images/white_rook.png';
import white_knight from '../../images/white_knight.png';
import white_bishop from '../../images/white_bishop.png';
import white_pawn from '../../images/white_pawn.png';
import { useHistory } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import useRemoveObject from '../../hooks/useRemoveObject';
import useAddUser from '../../hooks/useAddUser';
import { isNotEmittedStatement } from 'typescript';

const CELL_SIZE = 60;
const BOARD_SIZE = 8;
const boardWidth = CELL_SIZE * BOARD_SIZE;

let socket: any;

let grid = Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
  return Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
    return { click: 0, object: true, root: false, color: 0 }
  });
});

for (var i = 0; i < BOARD_SIZE; i++) {
  grid[0][i].object = false;
  grid[1][i].object = false;
  grid[6][i].object = false;
  grid[7][i].object = false;

  grid[0][i].color = 1;
  grid[1][i].color = 1;
  grid[6][i].color = -1;
  grid[7][i].color = -1;
}

const Game = ({ location }: { location: any }) => {
  const User = useUser();
  const Objects = useObjects();
  const addObject = useAddObject();
  const changeObject = useChangeObject();
  const removeObject = useRemoveObject();
  const addUser = useAddUser();

  const [board, setBoard] = useState(grid);
  const [turn, setTurn] = useState(1);
  const [clicked, setClicked] = useState({ row: -1, col: -1 });
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');
  const [move, setMove] = useState(false);

  const [connected, setConnected] = useState(false);
  const [take, setTake] = useState(false);
  const [type, setType] = useState('');

  const [dataIO, setDataIO] = useState(null);

  let history = useHistory();

  const ENDPOINT = 'localhost:8080';

  useEffect(() => {
    if (Objects.length < 32) {
      addObject('king', 4, 0, black_king, false);
      addObject('queen', 3, 0, black_queen, false);
      addObject('rook', 0, 0, black_rook, false);
      addObject('rook', 7, 0, black_rook, false);
      addObject('knight', 1, 0, black_knight, false);
      addObject('knight', 6, 0, black_knight, false);
      addObject('bishop', 2, 0, black_bishop, false);
      addObject('bishop', 5, 0, black_bishop, false);

      addObject('king', 4, 7, white_king, true);
      addObject('queen', 3, 7, white_queen, true);
      addObject('rook', 0, 7, white_rook, true);
      addObject('rook', 7, 7, white_rook, true);
      addObject('knight', 1, 7, white_knight, true);
      addObject('knight', 6, 7, white_knight, true);
      addObject('bishop', 2, 7, white_bishop, true);
      addObject('bishop', 5, 7, white_bishop, true);

      for (var i = 0; i < 8; i++) {
        addObject('pawn', i, 1, black_pawn, false);
        addObject('pawn', i, 6, white_pawn, true);
      }
    }
    console.log('user:', User);
    console.log('reload');

    const { roomID, username } = queryString.parse(location.search);

    if (typeof (roomID) === 'string' && typeof (username) === 'string') {
      setRoomID(roomID);
      setUsername(username);
    }

    socket = io(ENDPOINT);

    socket.emit('roomConnect', { roomID: roomID, username: User[0].username }, () => {
      setConnected(!connected);
    });

    return () => {
      socket.emit('removeRoom', { roomID: roomID });
      socket.off();
    }
  }, [ENDPOINT, location.search]);

  /*
  useEffect(() => {
    //console.log(location.search);
    const { roomID, username } = queryString.parse(location.search);

    if (typeof (roomID) === 'string' && typeof (username) === 'string') {
      setRoomID(roomID);
      setUsername(username);
    }

    socket = io(ENDPOINT);

    socket.emit('roomConnect', { roomID: roomID, username: User[0].username }, () => {
      setConnected(!connected);
    });

    return () => {
      socket.emit('removeRoom', { roomID: roomID });
      socket.off();
    }
  }, [ENDPOINT, location.search]);
  */
  useEffect(() => {
    socket.on('match', ({ roomID }: any) => {
      setRoomID(roomID);
      socket.emit('selectColor', { roomID: roomID }, () => {
        setTake(!take);
      })
    });
  }, [connected]);

  useEffect(() => {
    socket.on('setColor', ({ black, white, roomID }: any) => {
      setRoomID(roomID);

      axios.get(`/api/user/`)
        .then((res) => {
          if (black === res.data.user.username) {
            setType('black');
            setTurn(1);
          } else if (white === res.data.user.username) {
            setType('white');
            setTurn(1);
          }
          //setUsername(res.data.user.username);
        })
        .catch((error) => {
          alert('error');
        });
    })
  }, [take]);

  // 상대방의 움직임 반영
  useEffect(() => {
    socket.on('loadMove', ({ roomID, username, data, turn }: any) => {
      //setDataIO(data);

      // 상대방의 움직임에 따른 보드 변화
      grid = data.grid;

      console.log('type:', type, 'turn:', turn, data);

      setBoard([...grid]);
      setTurn(turn);
      for (let i = 0; i < data.object.length; i++) {
        changeObject(data.object[i].id, data.object[i].row, data.object[i].col, data.object[i].lived, data.object[i].isMoved, data.object[i].image, data.object[i].name);
        if(!data.object[i].lived && data.object[i].object === 'king') {
          alert('game set');
        }
      }
    });
  }, [move]);

  const isInside = (row: number, col: number) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  const clickControl = (rowIdx: number, colIdx: number) => {
    console.log('click:', rowIdx, colIdx);
    let grid = board;

    init(grid, 'click', 0);

    if (grid[rowIdx][colIdx].root) { // 이동 가능한 루트를 클릭했을 시
      const object: any = Objects.find((element) => { return element.y === clicked.row && element.x === clicked.col && element.lived });  // 선택했던 기물

      // 기물의 위치를 해당 위치로 수정
      const destObject: any = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });  // 목적지의 기물
      let objectName = '';

      let objectChange = [];

      if (destObject) {
        objectName = destObject.name;
        changeObject(destObject.id, colIdx, rowIdx, false, true, destObject.image, destObject.name);
        objectChange.push({ id: destObject.id, row: colIdx, col: rowIdx, lived: false, isMoved: true, object: objectName });
      }

      changeObject(object.id, colIdx, rowIdx, true, true, object.image, object.name);
      objectChange.push({ id: object.id, row: colIdx, col: rowIdx, lived: true, isMoved: true, object: objectName });

      grid[clicked.row][clicked.col].object = true;
      grid[rowIdx][colIdx].object = false;

      if (!object.color) {
        grid[rowIdx][colIdx].color = 1;
      } else {
        grid[rowIdx][colIdx].color = -1;
      }

      if (objectName === 'king') {
        console.log('game set');
      }
      //setTurn(turn + 1);

      init(grid, 'root', false);

      let data = {
        grid: grid,
        object: objectChange,
      };

      socket.emit('moveObject', { roomID: roomID, username: username, data: data, turn: turn }, () => {
        setMove(!move);
      })
    } else {
      grid[rowIdx][colIdx].click++;

      setBoard([...grid]);

      const object = Objects.find((element) => { return element.y === rowIdx && element.x === colIdx && element.lived });

      console.log(object);

      setClicked({ row: rowIdx, col: colIdx });
      searchRoot(object);
    }
  }

  const init = (object: any, attr: any, value: any) => {
    for (var i = 0; i < BOARD_SIZE; i++) {
      for (var j = 0; j < BOARD_SIZE; j++) {
        if (object[i][j][attr]) {
          object[i][j][attr] = value;
        }
      }
    }
  }

  const searchRoot = (object: any) => {
    let grid = board;

    init(grid, 'root', false);

    let color: number = 0;
    let initPos = 0;
    let dir: any;
    if (object.color) {
      color = -1;
      initPos = 7;
    } else {
      initPos = 0;
      color = 1;
    }

    switch (object.name) {
      case 'pawn':
        if (object.y == initPos + 1 * color) {
          if (grid[object.y + 2 * color][object.x].object && grid[object.y + 1 * color][object.x].object)
            grid[object.y + 2 * color][object.x].root = true;
        }
        if (isInside(object.y + 1 * color, object.x + 1) && !grid[object.y + 1 * color][object.x + 1].object && grid[object.y + 1 * color][object.x + 1].color === -1 * color) {
          grid[object.y + 1 * color][object.x + 1].root = true;
        }
        if (isInside(object.y + 1 * color, object.x - 1) && !grid[object.y + 1 * color][object.x - 1].object && grid[object.y + 1 * color][object.x - 1].color === -1 * color) {
          grid[object.y + 1 * color][object.x - 1].root = true;
        }

        if (isInside(object.y + 1 * color, object.x) && grid[object.y + 1 * color][object.x].object)
          grid[object.y + 1 * color][object.x].root = true;
        // 앙파상, 승진 구현

        setBoard([...grid]);

        console.log('board:', board);
        break;
      case 'knight':
        let dir_first = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        let dir_second = [[-1, -1], [-1, 1], [1, 1], [1, -1]];

        for (var i = 0; i < dir_first.length; i++) {
          for (var cnt: number = 0; cnt < 2; cnt++) {
            var j: number = i + cnt;
            if (j === 4) {
              j -= 4;
            }

            if (isInside(object.y + dir_first[i][0] + dir_second[j][0], object.x + dir_first[i][1] + dir_second[j][1])) {
              if (!grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].object) {
                if (grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].color === -1 * color) {
                  grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].root = true;
                }
              } else {
                grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].root = true;
              }
            }

          }
        }
        setBoard([...grid]);
        break;
      case 'rook':
        dir = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        rootFromDir(dir, object, color);

        // 캐슬링 구현

        break;
      case 'bishop':
        dir = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
        rootFromDir(dir, object, color);
        break;
      case 'king':
        dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];

        for (var i = 0; i < dir.length; i++) {
          if (isInside(object.y + dir[i][0], object.x + dir[i][1])) {
            if (!grid[object.y + dir[i][0]][object.x + dir[i][1]].object) {
              if (grid[object.y + dir[i][0]][object.x + dir[i][1]].color === -1 * color) {
                grid[object.y + dir[i][0]][object.x + dir[i][1]].root = true;
              }
            } else {
              grid[object.y + dir[i][0]][object.x + dir[i][1]].root = true;
            }
          }
        }

        // 캐슬링 구현

        setBoard([...grid]);
        break;
      case 'queen':
        dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];
        rootFromDir(dir, object, color);
        break;
      default:
        break;
    }
  }

  const rootFromDir = (dir: any, object: any, color: number) => {
    for (var i = 0; i < dir.length; i++) {
      var cnt = 1;
      while (isInside(object.y + dir[i][0] * cnt, object.x + dir[i][1] * cnt)) {
        // 기물이 존재하고 같은 색일때,
        if (!grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].object) {
          if (grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].color === color) {
            break;
          }
          if (grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].color === -1 * color) {
            grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].root = true;
            break;
          }
        } else {
          grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].root = true;
        }
        cnt++;
      }
    }
    setBoard([...grid]);
  }

  const checkDisabled = (rowIdx: number, colIdx: number) => {
    if ((type === 'black' && turn % 2 === 1) || (type === 'white' && turn % 2 === 0)) {
      if (board[rowIdx][colIdx].object) {
        if (board[rowIdx][colIdx].root) {
          return false;
        } else {
          return true;
        }
      } else {
        if (board[rowIdx][colIdx].root) {
          return false;
        }
        if ((board[rowIdx][colIdx].color === 1 && (turn % 2) === 1) || (board[rowIdx][colIdx].color === -1 && (turn % 2) === 0)) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  const checkColor = (color: string, rowIdx: number, colIdx: number) => {
    if (board[rowIdx][colIdx].root) {
      return "#cccccc";
    } else {
      return color;
    }
  }

  const initState = () => {
    grid = Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
      return Array.apply(null, Array(BOARD_SIZE)).map((el, idx) => {
        return { click: 0, object: true, root: false, color: 0 }
      });
    });
    
    for (var i = 0; i < BOARD_SIZE; i++) {
      grid[0][i].object = false;
      grid[1][i].object = false;
      grid[6][i].object = false;
      grid[7][i].object = false;
    
      grid[0][i].color = 1;
      grid[1][i].color = 1;
      grid[6][i].color = -1;
      grid[7][i].color = -1;
    }
    setBoard(grid);
    setTurn(1);
  }

  const backToHome = () => {
    Objects.map(object => {
      removeObject(object.id);
    })

    //initState();
    history.push('/home');
    window.location.reload();
  }

  const renderBoard = () => {
    return Array.apply(null, Array(BOARD_SIZE)).map((el, rowIdx) => {
      let cellList = Array.apply(null, Array(BOARD_SIZE)).map((el, colIdx) => {
        return (
          <div>
            {(rowIdx + colIdx) % 2 === 0 ? <button onClick={() => clickControl(rowIdx, colIdx)} disabled={checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#996600', rowIdx, colIdx), border: '1px solid black' }}>
              {Objects.map((object, index)=> {
                if (object.x === colIdx && object.y === rowIdx && object.lived)
                  return <img key={index} src={object.image} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
              })}
            </button> :
              <button onClick={() => clickControl(rowIdx, colIdx)} disabled={checkDisabled(rowIdx, colIdx)} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: checkColor('#ffcc66', rowIdx, colIdx), border: '1px solid black' }}>
                {Objects.map((object, index) => {
                  if (object.x === colIdx && object.y === rowIdx && object.lived) {
                    return <img key={index} src={object.image} style={{ width: CELL_SIZE - 10, height: CELL_SIZE - 10, paddingRight: '3px' }} />
                  }
                })}
              </button>
            }
          </div>
        )
      });

      return (
        <div
          key={rowIdx}
          style={{
            width: boardWidth,
            height: CELL_SIZE,
            display: 'flex',
            alignItems: 'flex-start'
          }}>
          {cellList}
        </div>
      )
    });
  }

  return (
    <div>

      <div style={{ marginLeft: '5%', marginTop: '5%', float: 'left' }}>
        {renderBoard()}
      </div>
      <div style={{ marginLeft: '5%', marginTop: '5%', float: 'left', width: '30%', textAlign: 'center' }}>
        <div >
          {turn % 2 === 1 ? <div style={{ fontSize: '1.5rem' }}>BLACK TURN {turn}</div> : <div style={{ fontSize: '1.5rem' }}>WHITE TURN {turn}</div>}
        </div>
        <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
          Black&nbsp;&nbsp;Dead
        </div>
        <div style={{ textAlign: 'left' }}>

          {Objects.map((object, index) => {
            if (!object.lived && !object.color) {
              return <img key={index} src={object.image} style={{ width: '25px', height: '30px', paddingRight: '3px' }} />
            }
          })}
        </div>
        <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
          White Dead
        </div>
        <div style={{ textAlign: 'left' }}>
          {Objects.map((object, index) => {
            if (!object.lived && object.color) {
              return <img key={index} src={object.image} style={{ width: '25px', height: '30px', paddingRight: '3px' }} />
            } 
          })}
        </div>
        <div>
          <Button variant="dark" onClick={backToHome}>뒤로 가기</Button>
        </div>
      </div>
    </div>
  )
}

export default Game;