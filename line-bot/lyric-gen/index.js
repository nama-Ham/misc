'use strict';

const express = require('express');
const rp = require('request-promise');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const iconv = require('iconv-lite');

const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};


const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    var song = req.body.events[0].message.text
    Promise
      .then(req.body.events.map(handleEvent))
      .then((lyric) => {
        res.json(lyric)
      })
      .then(req.body.events.map(handleEvent))
      .then((lyric) => {
        res.json(lyric)
      })

});

const client = new line.Client(config);

function handleEvent(event) {
  let replyText
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }else{
  	replyText = lyric_generator(event.message.text)
  }
  return replyText
/*
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
*/
}

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



function lyric_generator(song){
    return new Promise((resolve,reject) => {
      fs.readFile(song + ".lrs", (err, file) => {
         if(err) reject(err);
         else{
              var buf = new Buffer(file, 'binary');
              var retStr = iconv.decode(buf, "utf-8");
              resolve(retStr.split(" "));
          }
      })
    })
  }

lyric_generator("朝の歌")
  .then((sent_list) => {
    var lnum = randomNum(0, sent_list.length-1);
    return sent_list[lnum]
  })
  .then((sent) => {
    console.log(sent)
  })

function randomNum(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}



app.listen(PORT);
console.log(`Server running at ${PORT}`);