const puppeteer = require('puppeteer');
const cheerio=require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');


let url='http://mangahere.today/manga/karakai-jouzu-no-takagi-san'
let chap=[]
let browser
let imgArr
let mangaName

async function getManga(url) {
   browser = await puppeteer.launch({headless:false});
  let page = await browser.newPage();

  await page.goto(url, {waitUntil: 'networkidle2'});
  
  let html = await page.evaluate(()=> document.body.innerHTML)
  
  let $ = cheerio.load(html);
 


  let mangaDetails=$('div.manga-content').find('p').text().trim()

  mangaName= $('.media-body').find('.title-manga').text()
  $('.col-xs-12').each((index,element)=>{
   
   chap.push(
      {
        chapNum: $(element).find('a').text().trim(),
        chapLink: $(element).find('a').attr('href'),
        chapName: $(element).find('span').text()
      })
      
  })

   console.log(chap, mangaDetails)



  await page.close();

  chapterImg()


}

function download(url, filename){
  fetch(url)
  .then(res => {
      const dest = fs.createWriteStream(filename);
      res.body.pipe(dest)
  })
  .catch((err) => {
      console.log(err)
  })
}

async function getMangaByChap(chLink,ch,chNum) {
  
  let page = await browser.newPage();

  await page.goto(chLink, {waitUntil: 'networkidle2'});
  
  let html = await page.evaluate(()=> document.body.innerHTML)
  
  let $ = cheerio.load(html);

  imgArr = $('#arraydata').text().split(',')
  
  console.log(`Chapter-${chNum} :${ch}------Downloaded! `)
    for(var i=0;i<imgArr.length;i++){
    
      
      download(imgArr[i],`D:/${mangaName}/Chapter-${chNum}-${ch}/Page-${i+1}.jpg`)
    
    }

    setTimeout(()=>{
      page.close();
    },5000) 

}


getManga(url);

function chapterImg(){
  
  fs.mkdir(`D:/${mangaName}/`, (err) => {
    if (err) {
        return console.error(err);
    }})

//     for(var i=0;i<chap.length-1;i++){

      

//     fs.mkdir(`D:/TMT/Chapter-${chn}-${ch}`, (err) => {
//       if (err) {
//            console.error(err);
//       }
//       console.log('Directory created successfully!');

//   });

//  }
i=0;

 setInterval(()=>{
  var chn= chap[i].chapNum.slice(36)
  var ch=chap[i].chapName.slice(3)
  fs.mkdir(`D:/${mangaName}/Chapter-${chn}-${ch}`, (err) => {
    if (err) {
         console.error(err);
    }
    //console.log('Directory created successfully!');
  })

  getMangaByChap(chap[i].chapLink,chap[i].chapName.slice(3),chap[i].chapNum.slice(36)) 
  i++;
  if(i>chap.length) {
    exit()
  }
 },7000)


}