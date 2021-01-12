import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { useHistory } from "react-router-dom";
import useChangeLogged from '../../hooks/useChangeLogged';
import useLogged from '../../hooks/useLogged';

import useChangeUser from '../../hooks/useChangeUser';
import useAddUser from '../../hooks/useAddUser';
import useUser from '../../hooks/useUser';
import { addUser, User } from '../../modules/user';
import { useCookies } from "react-cookie";
import queryString from 'query-string';
import io from 'socket.io-client';

import {Button} from 'react-bootstrap';

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const ENDPOINT = 'localhost:8080';
let socket: any;
const MENU_ID = 'blahblah';

const Main = (location: any) => {
	const Logged = useLogged();
	const User = useUser();
	const addUser = useAddUser();
	const changeUser = useChangeUser();
	const changeLogged = useChangeLogged();
	const [roomList, setroomList] = useState([]);
	const [userList, setUserList] = useState<any[]>([{ id: '', name: '' }]);

	const [request, setRequest] = useState(false);
	const [confirm, setConfirm] = useState({ type: 'send', username: null });
	
	let [cookies] = useCookies(["access_token"]);
	let history = useHistory();

	const readCookie = async () => {
		if (cookies.access_token) {
			// 쿠키에 access_token이 존재하면 로그인 상태 유지
			loadUser();

		} else {
			history.push("/");
		}
	}

	useEffect(() => {
		socket = io(ENDPOINT);

		readCookie();
	}, [])

	const loadUser = async () => {
		await axios.get(`/api/user/`)
			.then((res) => {
				if (User.length === 0) {
					addUser(res.data.user.email, res.data.user.username, res.data.user.win, res.data.user.lose);
				}
				changeLogged(true, res.data.user.email);

			})
			.catch((error) => {
				alert('error');
			});
	}

	useEffect(() => {
		if (User.length) {
			socketio();
		}

	}, [ENDPOINT, location.search, User]);

	const socketio = () => {
		//socket = io(ENDPOINT);

		let name = User[0].username;
		console.log('name:', name);

		socket.emit('login', name, () => {
			//set_socket(!_socket);
		});

		return () => {
			socket.emit('disconnect');

			socket.off();
		}
	}

	useEffect(() => {
		socket.on('sendUser', ({ users }: any) => {
			setUserList(users);
		});
		console.log('userList:', userList);

	}, [userList]);

	useEffect(() => {
		socket.on('sendRoom', ({ rooms }: any) => {
			setroomList(rooms);
		});
		console.log('roomList:', roomList);

	}, [roomList]);

	useEffect(() => {
		socket.on('request', ({ fromUser, confirm }: any) => {
			setConfirm({ type: confirm, username: fromUser });
			console.log('check:', fromUser, confirm);
		});
	}, [request]);

	const handleRightClick = (name: string) => {	// 유저에게 match 요청

		//console.log('click');
		console.log('type:', confirm.type);
		socket.emit('requestMatch', { fromUser: User[0].username, toUser: name, confirm: confirm.type }, () => {
			loadUser();
			setRequest(!request);
		});
	}

	useEffect(() => {
		if (confirm.type === 'receive') {
			let check = window.confirm(confirm.username + '의 요청을 수락하시겠습니까?');

			if (check) {
				socket.emit('requestMatch', { fromUser: User[0].username, toUser: confirm.username, confirm: 'receive' }, () => {
					//setConfirm({type: '', username: null});
					setRequest(!request);
				});
			}
		} else if ( confirm.type === 'start'){
			alert('start');
		}
	}, [confirm]);
	
	const soloPlay = () => {
		history.push('/game')
	}

	return (
		<div>
			<div style={{ marginLeft: '5%', marginTop: '5%', width: '75%', height: '32rem', float: 'left', border: '2px solid black' }}>
				<ul className="list-group" style={{ overflow: 'auto' }}>
					{
						roomList.length ? roomList.map(room => {
							<li className="list-group-item">{room}</li>
						}) : <li className="list-group-item">생성된 방이 없습니다.</li>
					}
				</ul>
			</div>
			<div style={{ marginTop: '5%', width: '16%', height: '8rem', float: 'left', borderTop: '2px solid black', borderRight: '2px solid black', borderBottom: '2px solid black', textAlign: 'center' }}>
				{User.length && <div>
					<div>{User[0].username}</div>
					<div>Win: {User[0].win}</div>
					<div>Lose: {User[0].lose}</div>
				</div>
				}
			</div>
			<div style={{ width: '16%', height: '24rem', float: 'left', borderRight: '2px solid black', borderBottom: '2px solid black', textAlign: 'center' }}>
				<ul className="list-group" style={{ overflow: 'auto' }}>
					{
						userList.map(user => {
							return (
								<div>
									<ContextMenuTrigger id="same_unique_identifier">
										<div style={{ height: '1.6rem' }}>{user.name}</div>
									</ContextMenuTrigger>
									<ContextMenu id="same_unique_identifier" style={{ border: '0.5px solid black' }}>
										<MenuItem>
											<button onClick={() => handleRightClick(user.name)} style={{ borderBottom: '0.5px solid black', width: '6rem', backgroundColor: '#fffff1' }}>
												대국 신청
											</button>
										</MenuItem>
										<MenuItem >
											<button onClick={() => handleRightClick(user.name)} style={{ borderBottom: '0.5px solid black', width: '6rem', backgroundColor: '#fffff1' }}>
												정보 보기
											</button>
										</MenuItem>
									</ContextMenu>
								</div>
							)
						})}
				</ul>
			</div>
			<div style={{marginLeft: '5%', width:'100%'}}>
				<div style={{marginRight: '5%', float:'right', width: '15%'}}>
					<Button variant="dark" onClick={soloPlay}>혼자두기</Button>
				</div>
			</div>
		</div>
	)
}

export default Main;