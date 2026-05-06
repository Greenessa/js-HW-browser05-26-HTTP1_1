import http from 'http';
import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import { v4 as uuidv4 } from 'uuid';

const app = new Koa();

app.use(cors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const timestamp = Date.now();
const date = new Date(timestamp);
let createDate = date.toLocaleString();

let tickets = [];
  // {
  //   id: uuidv4(),
  //   name: 'Поменять краску в принтере',
  //   description: 'В комнате 404 поменять краску в принтере HP и проверить картридж во втором принтере',
  //   status: false,
  //   created: createDate,
  // },
  // {
  //   id: uuidv4(),
  //   name: 'Установить обновление',
  //   description: 'Вышло критическое обновление Windows, надо обновить сервер, предварительно сделав бэкап',
  //   status: false,
  //   created: createDate,
  // }

app.use(async (ctx) => {
  const { method, id } = ctx.request.query;

  if (ctx.request.method === 'GET') {
    switch (method) {
      case 'allTickets': {
        ctx.response.body = tickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          status: ticket.status,
          created: ticket.created,
        }));
        return;
      }

      case 'ticketById': {
        const ticket = tickets.find((item) => item.id === id);

        if (!ticket) {
          ctx.response.status = 404;
          ctx.response.body = { error: 'Ticket not found' };
          return;
        }

        ctx.response.body = ticket;
        return;
      }

      default:
        ctx.response.status = 404;
        ctx.response.body = { error: 'Method not found' };
        return;
    }
  }

  if (ctx.request.method === 'POST') {
    switch (method) {
      case 'createTicket': {
        const { name, description, status, created } = ctx.request.body;

        const newTicket = {
          id: uuidv4(),
          name,
          description,
          status: status === true || status === 'true',
          created,
        };

        tickets.push(newTicket);
        ctx.response.body = newTicket;
        return;
      }

      case 'updateTicket': {
        const { id, name, description } = ctx.request.body;
        const ticket = tickets.find((item) => item.id === id);

        if (!ticket) {
          ctx.response.status = 404;
          ctx.response.body = { error: 'Ticket not found' };
          return;
        }

        ticket.name = name;
        ticket.description = description;

        ctx.response.body = ticket;
        return;
      }

      case 'deleteTicket': {
        const { id } = ctx.request.body;
        const index = tickets.findIndex((item) => item.id === id);

        if (index === -1) {
          ctx.response.status = 404;
          ctx.response.body = { error: 'Ticket not found' };
          return;
        }

        tickets.splice(index, 1);
        ctx.response.body = { status: 'ok' };
        return;
      }

      case 'changeStatus': {
        const { id } = ctx.request.body;
        const ticket = tickets.find((item) => item.id === id);

        if (!ticket) {
          ctx.response.status = 404;
          ctx.response.body = { error: 'Ticket not found' };
          return;
        }

        ticket.status = !ticket.status;
        ctx.response.body = ticket;
        return;
      }

      default:
        ctx.response.status = 404;
        ctx.response.body = { error: 'Method not found' };
        return;
    }
  }

  ctx.response.status = 404;
  ctx.response.body = { error: 'Unsupported HTTP method' };
});

const server = http.createServer(app.callback());
const port = 7070;

server.listen(port, (err) => {
  if (err) {
    console.log('Error occured:', err);
    return;
  }

  console.log(`Server is listening on ${port}`);
});