import { Component } from 'react';
const lodash = require('lodash');

const BOARD_SIZE = 8;

const rootPawn = (object: any, initPos: number, color: number, grid: any, type: string) => {
	if (type === 'searchRoot') {
		if (object.y == initPos + 1 * color) {
			if (grid[object.y + 2 * color][object.x].object && grid[object.y + 1 * color][object.x].object) {
				grid[object.y + 2 * color][object.x].root = true;
				grid[object.y + 2 * color][object.x].image = object.image;
			}
		}

		if (isInside(object.y + 1 * color, object.x) && grid[object.y + 1 * color][object.x].object) {
			grid[object.y + 1 * color][object.x].root = true;
			grid[object.y + 1 * color][object.x].image = object.image;
		}
	}
	if(type === 'avoidCheck') {
		if (isInside(object.y + 1 * color, object.x + 1)) {
			grid[object.y + 1 * color][object.x + 1].root = true;
			grid[object.y + 1 * color][object.x + 1].image = object.image;
		}
		if (isInside(object.y + 1 * color, object.x - 1)) {
			grid[object.y + 1 * color][object.x - 1].root = true;
			grid[object.y + 1 * color][object.x - 1].image = object.image;
		}
	}
	if (isInside(object.y + 1 * color, object.x + 1) && !grid[object.y + 1 * color][object.x + 1].object && grid[object.y + 1 * color][object.x + 1].color === -1 * color) {
		grid[object.y + 1 * color][object.x + 1].root = true;
		grid[object.y + 1 * color][object.x + 1].image = object.image;
	}
	if (isInside(object.y + 1 * color, object.x - 1) && !grid[object.y + 1 * color][object.x - 1].object && grid[object.y + 1 * color][object.x - 1].color === -1 * color) {
		grid[object.y + 1 * color][object.x - 1].root = true;
		grid[object.y + 1 * color][object.x - 1].image = object.image;
	}
	return grid;
}

const rootKnight = (object: any, color: number, grid: any) => {
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
						grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].image = object.image;
					}
				} else {
					grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].root = true;
					grid[object.y + dir_first[i][0] + dir_second[j][0]][object.x + dir_first[i][1] + dir_second[j][1]].image = object.image;
				}
			}
		}
	}
	return grid;
}

const rootFromDir = (dir: any, object: any, color: number, grid: any) => {
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
					grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].image = object.image;
					break;
				}
			} else {
				grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].root = true;
				grid[object.y + dir[i][0] * cnt][object.x + dir[i][1] * cnt].image = object.image;
			}
			cnt++;
		}
	}
	return grid;
}

const rootKing = (dir: any, object: any, color: number, grid: any) => {
	for (var i = 0; i < dir.length; i++) {
		if (isInside(object.y + dir[i][0], object.x + dir[i][1])) {
			if (!grid[object.y + dir[i][0]][object.x + dir[i][1]].object) {
				if (grid[object.y + dir[i][0]][object.x + dir[i][1]].color === -1 * color) {
					grid[object.y + dir[i][0]][object.x + dir[i][1]].root = true;
					grid[object.y + dir[i][0]][object.x + dir[i][1]].image = object.image;
				}
			} else {
				grid[object.y + dir[i][0]][object.x + dir[i][1]].root = true;
				grid[object.y + dir[i][0]][object.x + dir[i][1]].image = object.image;
			}
		}
	}

	return grid;
}

const checkCastling = (object: any, Objects: any, grid: any, board: any, castling: any) => {
	if (object.name === 'rook' && !object.isMoved) {	// 룩 기준 -> 움직인 적 없이 초기 위치일시
		if (!object.color && object.y === 0 && (object.x === 0 || object.x === 7)) {	// 블랙
			const king: any = Objects.find((element:any) => { return element.name === 'king' && element.color === object.color });
			if (!king.isMoved && king.y === 0 && king.x === 4) {
				if (object.x === 0) {
					for (let i = 1; i < 4; i++) {
						const temp: any = Objects.find((element:any) => { return element.y === 0 && element.x === object.x + i });
						if (temp) {
							return grid;
						}
						if(judgeCheck(Objects, board, grid, object, king.y, king.x - i + 1)) {
							return grid;
						}
					}
					castling.push({ checked: true, id: king.id, name: 'king', row: 0, col: 2, color: object.color, image: king.image });
					return grid;
				} else {
					for (let i = 1; i < 3; i++) {
						const temp: any = Objects.find((element:any) => { return element.y === 0 && element.x === object.x - i });
						if (temp) {
							return grid;
						}
						if(judgeCheck(Objects, board, grid, object, king.y, king.x + i - 1)) {
							return grid;
						}
					}
					castling.push({ checked: true, id: king.id, name: 'king', row: 0, col: 6, color: object.color, image: king.image });
					return grid;
				}
			}
		} else if (object.color && object.y === 7 && (object.x === 0 || object.x === 7)) {	// 화이트
			const king: any = Objects.find((element:any) => { return element.name === 'king' && element.color === object.color });
			if (!king.isMoved && king.y === 7 && king.x === 4) {
				if (object.x === 0) {
					for (let i = 1; i < 4; i++) {
						const temp: any = Objects.find((element:any) => { return element.y === 7 && element.x === object.x + i });
						if (temp) {
							return grid;
						}
						if(judgeCheck(Objects, board, grid, object, king.y, king.x - i + 1)) {
							return grid;
						}
					}
					castling.push({ checked: true, id: king.id, name: 'king', row: 7, col: 2, color: object.color, image: king.image });
					return grid;
				} else {
					for (let i = 1; i < 3; i++) {
						const temp: any = Objects.find((element:any) => { return element.y === 7 && element.x === object.x - i });
						if (temp) {
							return grid;
						}

						if(judgeCheck(Objects, board, grid, object, king.y, king.x + i - 1)) {
							return grid;
						}
					}
					castling.push({ checked: true, id: king.id, name: 'king', row: 7, col: 6, color: object.color, image: king.image });

					return grid;
				}
			}
		}
	} else if (object.name === 'king' && !object.isMoved) {
		const rook: any = Objects.filter((element:any) => element.name === 'rook' && element.color === object.color && !element.isMoved);
		for (let i = 0; i < rook.length; i++) {
			if (rook[i].x === 7) {
				let isBlanked = true;
				for (let i = 1; i < 3; i++) {
					const temp: any = Objects.find((element:any) => { return element.y === object.y && element.x === object.x + i });
					if (temp) {
						isBlanked = false;
					}
					if(judgeCheck(Objects, board, grid, object, object.y, object.x + i - 1)) {
						isBlanked = false;
					}
				}
				if (isBlanked) {
					grid[object.y][object.x + 2].root = true;
					grid[object.y][object.x + 2].image = object.image;
					castling.push({ checked: true, id: rook[i].id, name: 'rook', row: object.y, col: object.x + 1, color: object.color, image: rook[i].image });
				}
			} else if (rook[i].x === 0) {
				let isBlanked = true;
				for (let i = 1; i < 4; i++) {
					const temp: any = Objects.find((element:any) => { return element.y === object.y && element.x === object.x - i });
					if (temp) {
						isBlanked = false;
					}
					if(judgeCheck(Objects, board, grid, object, object.y, object.x - i + 1)) {
						isBlanked = false;
					}
				}
				if (isBlanked) {
					grid[object.y][object.x - 2].root = true;
					grid[object.y][object.x - 2].image = object.image;
					castling.push({ checked: true, id: rook[i].id, name: 'rook', row: object.y, col: object.x - 1, color: object.color, image: rook[i].image });
				}
			}
		}
		return grid;
	}
	return grid;
}

const judgeCheck = async (Objects:any, board:any, searchBoard:any, object:any, row:number, col:number) => {
	const objects: any = Objects.filter((element:any) => object.color === !element.color && element.lived);

	await objects.map(async (element: any) => {
		let tBoard: any = await searchRoot(board, element, 'judgeCheck');

		if(tBoard[row][col].root) {
			searchBoard[row][col].root = false;
		}
	})
	
	 return searchBoard;
}

// 앙 파상을 탐색하는 함수
const rootInPassing = (object: any, searchBoard: any, inPassing: any) => {
	if (inPassing && inPassing.object && !inPassing.object.isMoved && object.name === 'pawn') {	// 바로 이전 턴에 움직인, 처음 움직인 폰에 한해서 적용
		if (!inPassing.object.color) {	//블랙

			if (object.y === inPassing.object.y + 2) {
				if (object.x === inPassing.object.x - 1) {
					searchBoard[object.y - 1][object.x + 1].root = true;
					searchBoard[object.y - 1][object.x + 1].image = object.image;

					searchBoard[object.y][object.x + 1].status = 'inPassing';
				} else if (object.x === inPassing.object.x + 1) {
					searchBoard[object.y - 1][object.x - 1].root = true;
					searchBoard[object.y - 1][object.x - 1].image = object.image;
					searchBoard[object.y][object.x - 1].status = 'inPassing';
				}
			}
		} else {
			if (object.y === inPassing.object.y - 2) {
				if (object.x === inPassing.object.x - 1) {
					searchBoard[object.y + 1][object.x + 1].root = true;
					searchBoard[object.y + 1][object.x + 1].image = object.image;

					searchBoard[object.y][object.x + 1].status = 'inPassing';
				} else if (object.x === inPassing.object.x + 1) {
					searchBoard[object.y + 1][object.x - 1].root = true;
					searchBoard[object.y + 1][object.x - 1].image = object.image;
					searchBoard[object.y][object.x - 1].status = 'inPassing';
				}
			}
		}
	}
	return searchBoard;
}

const searchRoot = async (board:any, object: any, type: any) => {
	let searchBoard = lodash.cloneDeep(board);

	init(searchBoard, 'root', false);

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
			searchBoard = rootPawn(object, initPos, color, searchBoard, type);

			break;
		case 'knight':
			searchBoard = rootKnight(object, color, searchBoard);
			break;
		case 'rook':
			dir = [[-1, 0], [1, 0], [0, 1], [0, -1]];
			searchBoard = rootFromDir(dir, object, color, searchBoard);

			break;
		case 'bishop':
			dir = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
			searchBoard = rootFromDir(dir, object, color, searchBoard);
			break;
		case 'king':
			dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];

			searchBoard = rootKing(dir, object, color, searchBoard);

			break;
		case 'queen':
			dir = [[-1, -1], [1, 1], [-1, 1], [1, -1], [-1, 0], [1, 0], [0, 1], [0, -1]];
			searchBoard = rootFromDir(dir, object, color, searchBoard);
			break;
		default:
			break;
	}

	return searchBoard;
}

const isInside = (row: number, col: number) => {
	return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
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

module.exports = { rootPawn, rootKnight, rootFromDir, rootKing, checkCastling, rootInPassing };