import * as http from 'node:http';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();
const users = [
    {
        id: uuidv4(),
        username: 'Andy',
        age: 45,
        hobbies: ['barmen'],
    },
    {
        id: uuidv4(),
        username: 'Mary',
        age: 32,
        hobbies: ['barista'],
    },
];
const isUUID = (id) => {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
};
const server = http.createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    const params = request.url?.split('/')[request.url?.split('/').length - 1];
    console.log('Requested URL:', request.url, 'Params:', params);
    if (request.method === 'OPTIONS') {
        response.writeHead(200);
        return response.end();
    }
    if (request.method === 'GET' && request.url === '/users') {
        getAllUsers(response);
    }
    else if (request.method === 'GET' && request.url?.startsWith('/users/')) {
        if (params) {
            getUserById(params, response);
        }
        else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Invalid userId format' }));
        }
    }
    else if (request.method === 'POST' && request.url === '/users') {
        createUser(request, response);
    }
    else if (request.method === 'PUT' && request.url?.startsWith('/users/')) {
        if (params) {
            updateUser(params, request, response);
        }
        else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Invalid userId format' }));
        }
    }
    else if (request.method === 'DELETE' &&
        request.url?.startsWith('/users/')) {
        if (params) {
            deleteUser(params, response);
        }
        else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Invalid userId format' }));
        }
    }
    else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Not Found' }));
    }
});
async function getAllUsers(resp) {
    resp.writeHead(200, { 'Content-Type': 'application/json' });
    resp.end(JSON.stringify(users));
}
async function getUserById(userId, resp) {
    if (!isUUID(userId)) {
        resp.writeHead(400, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: 'Invalid userId format' }));
    }
    const user = users.find((u) => u.id === userId);
    if (!user) {
        resp.writeHead(404, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: `User with id ${userId} not found` }));
    }
    resp.writeHead(200, { 'Content-Type': 'application/json' });
    resp.end(JSON.stringify(user));
}
async function createUser(request, resp) {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        try {
            const { username, age, hobbies, } = JSON.parse(body);
            if (!username || !age || !hobbies) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                return resp.end(JSON.stringify({
                    message: 'Missing required fields: username, age, or hobbies',
                }));
            }
            const newUser = { id: uuidv4(), username, age, hobbies };
            users.push(newUser);
            resp.writeHead(201, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(newUser));
        }
        catch (error) {
            resp.writeHead(500, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    });
}
async function updateUser(userId, request, resp) {
    if (!isUUID(userId)) {
        resp.writeHead(400, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: 'Invalid userId format' }));
    }
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        resp.writeHead(404, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: `User with id ${userId} not found` }));
    }
    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        try {
            const { username, age, hobbies, } = JSON.parse(body);
            if (!username || !age || !hobbies) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                return resp.end(JSON.stringify({
                    message: 'Missing required fields: username, age, or hobbies',
                }));
            }
            users[userIndex] = { ...users[userIndex], username, age, hobbies };
            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(users[userIndex]));
        }
        catch (error) {
            resp.writeHead(500, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    });
}
async function deleteUser(userId, resp) {
    if (!isUUID(userId)) {
        resp.writeHead(400, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: 'Invalid userId format' }));
    }
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        resp.writeHead(404, { 'Content-Type': 'application/json' });
        return resp.end(JSON.stringify({ message: `User with id ${userId} not found` }));
    }
    users.splice(userIndex, 1);
    resp.writeHead(204);
    resp.end();
}
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
