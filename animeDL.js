const puppeteer = require('puppeteer');
const cheerio=require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');
const {google} = require('googleapis');
const drive = google.drive('v3');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const NetworkSpeed = require('network-speed');  
const testNetworkSpeed = new NetworkSpeed();
let netSpeed
// import logSymbols from 'log-symbols';






let url='https://gogoanime.be/anime/violet-evergarden-VLEz/'
let ep=[]
let browser
let frame
let episodeLink=[]

let animeName
let animeNameCorrected 
let $
const width = 1024;
    const height = 1600;

async function getManga(url) {

   browser = await puppeteer.launch({args: [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process'
  ],'defaultViewport' : { 'width' : width, 'height' : height },headless:false, executablePath: "C://Program Files//BraveSoftware//Brave-Browser//Application//brave.exe"});
  let page = await browser.newPage();

  await page.goto(url, {waitUntil: 'networkidle2'});
  
  let html = await page.evaluate(()=> document.body.innerHTML)
  
  $ = cheerio.load(html);
 




  animeName= $('.heading-name').find('a').text()
  animeNameCorrected= animeName.replace(/[^\w\s]/gi, '')
  $('.eps-item').each((index,element)=>{
   
   ep.push(
      {
        epName: $(element).attr('title'),
        epLink: $(element).attr('href')
      })
      
  })

   
   console.log(`ANIME NAME :`);
   console.log(`${animeName}`);




  await page.close();

  epDl(ep.length);


}



getManga(url);

async function epDl(n){

  console.log('=================Starting to Fetch episode links ( this step might take time )=================')

  for(var i=0;i<n;i++){

    let page = await browser.newPage();

    await page.goto(ep[i].epLink, {waitUntil: 'networkidle2'});


    if(i<1){
      console.log('Checking for Adverts')

      await page.waitForSelector('button.close')
      console.log('======================Found adverts and closing it=====================')
      await page.click('button.close')
    }


    
    
    const frameHandle = await page.$("iframe[id='iframe-embed']");
    frame = await frameHandle.contentFrame();

    let html = await frame.evaluate(()=> document.body.innerHTML)

    $ = cheerio.load(html);

    $('video.jw-video').each((index,element)=>{
      episodeLink.push({epn:i+1,epl:$(element).attr('src')})

        
    })
    

      console.log(`Episode Link ${i+1} Downloaded!`)
    if(i==n-1){
      browser.close()
      console.log('=================Done with link fetch phase=================')
      console.log('=================List of Links fetched=================','Total ep fetched:',episodeLink.length)

      console.log(episodeLink)
      console.log(`=================Initiating download of the  ${episodeLink.length} episodes at : ${netSpeed}MB/s =================`)
      console.log('=================Do not worry if it looks stuck=================')


      startDownload()
    }
    

  }

}


getNetworkDownloadSpeed();

async function getNetworkDownloadSpeed() {
  const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
  const fileSizeInBytes = 500000;
  const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
  netSpeed=speed.mbps;
}


function download(url, filename,i){
  fetch(url)
  .then(res => {
      const dest = fs.createWriteStream(filename);
      res.body.pipe(dest).on('finish',()=>{
        console.log(`Episode ${i+1}-------------Downloaded! `)

      })
  })
  .catch((err) => {
    console.log(`Episode ${i+1}-------------Failed`)
  })
}


function startDownload(){


  fs.mkdir(`D:/${animeNameCorrected}`, (err) => {
    if (err) {
        return console.error(err);
    }})
   

  for(var i=0; i < episodeLink.length;i++){

    download(episodeLink[i].epl,`D:/${animeNameCorrected}/${episodeLink[i].epn}.mp4`,i)
    

  }


}