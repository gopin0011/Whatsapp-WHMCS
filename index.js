// node 18 cd node_modules/whatsapp-web.js/ npm install puppeteer@22.1.0
const { Client, LocalAuth } = require('whatsapp-web.js');
// const fs = require('fs');
const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');

// initial instance
const PORT = process.env.PORT || 8081;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]},
});

let today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// index routing and middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get('/qr', (req, res) => {
  res.sendFile('status.html', {root: __dirname});
});

// initialize whatsapp and the example event
client.on('message', msg => {
  if (msg.body == '!ping') {
    msg.reply('pong');
  } else if (msg.body == 'skuy') {
    msg.reply('helo ma bradah');
  }
});
client.initialize();

// socket connection
io.on('connection', (socket) => {
  //var now = today.toLocaleString();
  //var now = today();
  socket.emit('message', `${today()} Connected`);

  client.on('qr', (qr) => {
    try {
      qrcode.toDataURL(qr, (err, url) => {
        if (err) {
          // Handle the error
          console.error("Error generating QR code:", err);
          return;
        }
        socket.emit("qr", url);
        socket.emit('message', `${today()} QR Code received`);
      });
    } catch (error) {
      // Handle any synchronous errors that may occur within the try block
      console.error("Error in QR event listener:", error);
    }
  });

  client.on('ready', () => {
    socket.emit('message', `${today()} WhatsApp is ready!`);
  });

  client.on('authenticated', (session) => {
    socket.emit('message', `${today()} Whatsapp is authenticated!`);
    // sessionCfg = session;
    // fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
    //   if (err) {
    //     console.error(err);
    //   }
    // });
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', `${today()} Auth failure, restarting...`);
  });

  client.on('disconnected', function() {
    socket.emit('message', `${today()} Disconnected`);
    
    client.destroy();
    client.initialize();
    // if (fs.existsSync(SESSION_FILE_PATH)) {
    //   fs.unlinkSync(SESSION_FILE_PATH, function(err) {
    //     if(err) return console.log(err);
    //     console.log('Session file deleted!');
    //   });
    //   client.destroy();
    //   client.initialize();
    // }
  });
});

    // send message routing
    app.post('/api/send', (req, res) => {
        // res.send('Hello World, from express');
        const phone = req.body.phone;
        const message = req.body.message;
        client.sendMessage(phone.substring(1) + "@c.us", message)
            .then(response => {
            res.status(200).json({
                error: false,
                data: {
                message: 'success',
                meta: response,
                },
            });
            })
            .catch(error => {
            res.status(200).json({
                error: true,
                data: {
                message: 'error',
                meta: error,
                },
            });
        });
    });
server.listen(PORT, () => {
  console.log('App listen on port ', PORT);
});


// curl -d "phone=+6281394420922@c.us&message=value2" -X POST http://localhost:8000/api/send
// { "phone": "+6282120017817", "message": "Halo dari API Flask!" }
/* troubleshoot
https://github.com/Eugeny/tabby/issues/9457
https://askubuntu.com/questions/1527215/how-to-install-and-use-the-app-depends-on-libappindicator1-in-ubuntu-24-04
installation 
https://wwebjs.dev/guide/installation.html
*/

