const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

/*
const jqueryMin = require('https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js')
const bootstrap = require('http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js')
const svg = require('./node_modules/svg.js/dist/svg.js')
const draw = require('./node_modules/svg.draw.js/dist/svg.draw.js')
const draggable = require('./node_modules/svg.draggable.js/dist/svg.draggable.js')
const select = require('./node_modules/svg.select.js/dist/svg.select.js')
const resize = require('./node_modules/svg.resize.js/dist/svg.resize.js')
const colorAt = require('./node_modules/svg.colorAt.js/dist/svg.colorAt.js')
const flieSaver = require('./node_modules/file-saver/FileSaver.js')
const saveSvgAsPng = require('./node_modules/save-svg-as-png/saveSvgAsPng.js')
const myScript = require('test/myScript.js')
const jquery = require('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js')
*/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 1000})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
