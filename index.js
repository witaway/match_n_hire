require('dotenv').config()
require('./utils/make_arrays_great_again')
require('./utils/simplify_scenes_export')

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const path = require('path')

function initializeDataManagement(bot, dbFile, sessionFile) {

    const LocalSession = require('telegraf-session-local')
    const low          = require('lowdb')
    const FileSync     = require('lowdb/adapters/FileSync')
    
    const adapter = new FileSync(dbFile)
    const db = low(adapter)
    
    if(!db.has('users').value()) {
        db.set('users', []).write()
    }
    
    if(!db.has('companies').value()) {
        db.set('companies', []).write()
    }
    
    if(!db.has('cards').value()) {
        db.set('cards', []).write()
    }

    if(!db.has('likes').value()) {
        db.set('likes', []).write()
    }
    
    //Getting access to database via ctx
    bot.use((ctx, next) => {
        ctx.state.db = db
        next()
    })
    
    //Session storage initialisation
    bot.use((new LocalSession({ database: sessionFile })).middleware())
}

function registerScenes(stage, dir) {
    
    let modules = require('require-dir')(dir)
    let arraysOfScenes = Object.values(modules)
    let arrayOfScenes = [].concat(...arraysOfScenes)
    
    const sceneConstructor = require('telegraf/scenes/base')
    
    arrayOfScenes.forEach((scene) => {
        if(scene.constructor === sceneConstructor) {
            stage.register(scene)
        }
    })
}


let process = require('process')
const bot = new Telegraf(process.env.BOT_TOKEN)

initializeDataManagement(bot, process.env.DATABASE_FILE, 
                              process.env.SESSION_FILE)

const LanguagesMiddleware = require('./utils/localisation_middleware')
bot.use(LanguagesMiddleware(process.env.PHRAZES_FILE))

bot.use((ctx, next) => {
    
    ctx.state.userId = `${ctx.message.chat.id}:${ctx.message.from.id}`
    
    ctx.state.triggered = false

    ctx.state.abortSettings = async function(scene) {
        ctx.session.settings = null
        await ctx.scene.enter(scene)
    }

    next()
})
//ss
const stage = new Stage()
const scDir = process.env.SCENES_DIR
registerScenes(stage, scDir)
registerScenes(stage, path.join(scDir, 'user'))
registerScenes(stage, path.join(scDir, 'company'))
registerScenes(stage, path.join(scDir, 'admin'))
bot.use(stage.middleware())

bot.command('/start', (ctx) => {
    ctx.session.settings = {}
    ctx.scene.enter('auth') 
})

//ctx.scene.current.id - current scene name
//ctx.session - storage for current session
//ctx.state - storage between middlewares

bot.startPolling()