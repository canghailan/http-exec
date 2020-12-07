FROM node:lts

WORKDIR /app

COPY index.js .

EXPOSE 3000

CMD [ "node", "/app/index.js" ]