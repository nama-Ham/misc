'use strict';

require('dotenv').config();
const express = require('express');
const rp = require('request-promise');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};


function postADRSIR(event){
	let dev = defineOperation(event)[0]
	let ope = defineOperation(event)[1]

    const options = {
        method: 'POST',
        uri: 'http://api.beebotte.com/{XXXXXXXX}',
        body: {
            data:[{
                room: 'living',
                device: dev,
                action: ope
            }]
        },
    	json: true
    };

    return rp(options)
        .then(function (res) {
            console.log(res);
        })
        .catch(function (err) {
            console.log(err)
        });
}


const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent),req.body.events.map(postADRSIR))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  let replyText
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }else{
  	replyText = defineOperation(event)[0] + 'を' + defineOperation(event)[1]
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

function replaceAll(str, before, after) {
    return str.split(before).join(after);
};

function defineOperation(event){
	let device
	let operation
	let sentence = event.message.text
	if(sentence.match(/つけて/)){
		device = replaceAll(sentence,'つけて','')
		operation = 'on'
	}else if(sentence.match(/消して/)){
		device = replaceAll(sentence,'消して','')
		operation = 'off'
	}else{
		device = 'none'
		operation = 'none'
	}
	return [device, operation]
}



app.listen(PORT);
console.log(`Server running at ${PORT}`);
