const fs = require('fs')
const ini = require('ini')
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
module.exports = (client) => {

  client.Rnd = (min, max) => {
    return Math.floor((Math.random()*(max-min))+min)
  }

  client.getFiles = async (dir) => {

    const cmdFiles = await readdir(dir);
    let legacy = []
    let current = []
    cmdFiles.forEach(f => {
      if (!f.startsWith("save_") && !f.startsWith("_iislandsofwarsave_")) return;
      if (f.startsWith("save_"))current.push(f)
      else legacy.push(f)
    });
    console.log(`Found ${current.length} current save files and ${legacy.length} legacy files for a total of ${current.length+ legacy.length} files.`)
  return [current, legacy]}

  client.readLocalFile = (file = `./readyiisland.ini`) => {
    let result= fs.readFileSync(file, 'utf-8')
    return client.readFile(result)
  }

  client.readFile = (file) => {
    let result = ini.parse(file)
    return result
  }
  client.saveFile = (object) => {
    let result = ini.stringify(object)
    return result
  }
 
  client.finder = async (path =require('electron').remote.getGlobal('loaded').path ) =>{
    let files
    client = {}
    require('./functions')(client)
    files = await client.getFiles(path)
    return files
    
    }
 
    client.parse_island = (file, object = true, island = false) => {  
      try{
        let parsed_save = {
          "block": [],
          "attachment": [],
          "keybind": [],
        };
        let save_file 
        if(!island){
          if(!object) save_file = client.readFile(file);
          else save_file = file
        }
        let buffer
        if(!island) buffer = save_file.island.island.split(' ');
        else buffer = file
        let bufferCount = 0;
        parsed_save.coreX = buffer[bufferCount];
        bufferCount++;
        parsed_save.coreY = buffer[bufferCount];
        bufferCount++;
        parsed_save.islandWidth = buffer[bufferCount];
        bufferCount++;
        parsed_save.islandHeight = buffer[bufferCount];
        bufferCount++;
        parsed_save.islandOffsetX = buffer[bufferCount];
        bufferCount++;
        parsed_save.islandOffsetY = buffer[bufferCount];
        bufferCount++;
        for (let i = 0; i < 12; i++) {
          parsed_save.block[i] = [];
          parsed_save.attachment[i] = [];
          parsed_save.keybind[i] = [];
          for (let j = 0; j < 12; j++) {
            if (buffer[bufferCount] !== "_") {
              parsed_save.block[i][j] = buffer[bufferCount];
            };
            bufferCount++;
            if (buffer[bufferCount] !== "_") {
              parsed_save.attachment[i][j] = buffer[bufferCount];
            };
            bufferCount++;
            if (buffer[bufferCount] !== "_") {
              parsed_save.keybind[i][j] = buffer[bufferCount];
            };
            bufferCount++;
          };
        };
        return parsed_save;
      }catch(e){console.error(e);};
    };
    client.reverse_island = (par) => {
      try{
        let rev = par.coreX+' '+par.coreY+' '+par.islandWidth+' '+par.islandHeight+' '+par.islandOffsetX+' '+par.islandOffsetY;
        for(let i = 0; i < 12; i++) {
          for(let j = 0; j < 12; j++) {
            rev = rev+' '+(par.block[i][j]?par.block[i][j]:'_')+' '+(par.attachment[i][j]?par.attachment[i][j]:'_')+' '+(par.keybind[i][j]?par.keybind[i][j]:'_')
          }
        }
        return rev;
      }catch(e){console.error(e)};
    };
  
  
  // `await client.wait(1000);` to "pause" for 1 second.
  client.wait = require("util").promisify(setTimeout);

  client.parse_inv = (inv, v) => {

  }
  
  client.getIds = (v) => {
    try{
      return require(`../assets/ids/${v}.json`)
    }
    catch (e){
      return
    }
  }

  client.parse_islandId = (island, v) => {
    let ids = client.getIds(v)
    if(!ids) return new Error(`No Ids file found for v${v}!`)
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        if (island.block[i][j]) {
          let name
          let other = island.block[i][j].split("|")
          if (v >= 6.2) {
            name = other[1];
            while (!other[0])
            other.shift()
            other.shift()
          }
          //else name = island.block[i][j].split("|")[0];
          if(!name) return
          if(other.length > 6) other.forEach((i,index) =>{
            console.log(i,index)
            if(index < 5 || !i) return
            console.log('succ')
            i = i.split(':')
            console.log(i)
            i[0] = ids.properties[`${i[0]}`].toLowerCase()
            other[index] = i.join(':')
            console.log(other[index])
          })
          island.block[i][j] = `${ids.items[`${name}`]}|${other.join('|')}`
        }
        if (island.attachment[i][j]) {
          let name
          let other = island.attachment[i][j].split("|")
          if (v >= 6.2) {
            name = other[1];
            while (!other[0])
            other.shift()
            other.shift()
          }
          //else name = island.attachment[i][j].split("|")[0];
          if(!name) return
          island.attachment[i][j] = `${ids.items[`${name}`]}|${other.join('|')}`
        }
      }
    }
    return island
  }
  }