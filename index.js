const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { spawn } = require('child_process');

const CHARSET = process.env['CHARSET'];
const COMMAND = process.env['COMMAND'] ? new Set(process.env['COMMAND'].split(',')) : undefined;
const PATH = process.env['PATH'];
const PORT = process.env['PORT'] || 3000;
const TOKEN = process.env['TOKEN'] ? new Set(process.env['TOKEN'].split(',')) : undefined;

function check_command(command, commands = COMMAND) {
    return commands ? commands.has(command) : true;
}

function check_token(token, tokens = TOKEN) {
    return tokens ? tokens.has(token) : true;
}

function parse_token(authorization) {
    if (authorization) {
        let r = /Bearer\s+(\S*)/i.exec(authorization)
        if (r && r[1]) {
            return r[1];
        }
    }
    return undefined;
}

function http_exec(req, res) {
    let { pathname, query } = url.parse(req.url);
    let command = pathname.slice(1);
    let args = querystring.unescape(query);
    let options = {
        env: { PATH },
        shell: process.platform === 'win32'
    };
    let p = args ?
        spawn(`${command} ${args}`, { ...options, shell: true }) :
        spawn(command, options);
    if (CHARSET) {
        res.setHeader('content-type', `;charset=${CHARSET}`);
    }
    p.on('error', (e) => {
        res.statusCode = 500;
        res.write(e.message);
    });
    p.on('exit', () => {
        res.end();
    });
    p.stdout.pipe(res);
    p.stderr.pipe(res);
    req.pipe(p.stdin);
}

function token_authorization(next, options) {
    if (options && options.token) {
        return (req, res) => {
            let authorization = req.headers['authorization'];
            let token = parse_token(authorization);
            if (check_token(token, options.token)) {
                next(req, res);
            } else {
                res.statusCode = 403;
                res.end();
            }
        };
    } else {
        return next;
    }
}

function command_filter(next, options) {
    if (options && options.command) {
        return (req, res) => {
            let { pathname } = url.parse(req.url);
            let command = pathname.slice(1);
            if (check_command(command, options.command)) {
                next(req, res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        }
    } else {
        return next;
    }
}

function server(options) {
    let o = Object.assign({
        exec: http_exec,
        port: PORT,
        command: COMMAND,
        token: TOKEN
    }, options);
    let handler = o.exec;
    if (o.token) {
        handler = token_authorization(handler, o);
    }
    if (o.command) {
        handler = command_filter(handler, o);
    }
    let server = http.createServer(handler);
    server.listen(o.port);
    return server;
}

module.exports = {
    check_command,
    check_token,
    parse_token,
    http_exec,
    server
};