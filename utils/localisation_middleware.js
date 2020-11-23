module.exports = function(phrazes_file) {

    const fs = require('fs')

    let jsonString = fs.readFileSync(phrazes_file, 
        { encoding: 'utf8', flag: 'r' })
    
    let jsonObject = JSON.parse(jsonString)

    let getPhraze = function(language, phraze) {
            
        language = language.toLowerCase()
        phraze   = phraze.toLowerCase()
        
        if(!jsonObject.hasOwnProperty(language)) {
            return `@NO ${language} LANGUAGE@`
        }
        if(!jsonObject[language].hasOwnProperty(phraze)) {
            return `@${language}::${phraze}`
        }

        return jsonObject[language][phraze]
    }

    let middleware = (ctx, next) => {
        
        let handler = {
            get: (target, name) => {
                let language = ctx.session.language || 'english'
                let phraze = name
                return getPhraze(language, phraze)
            }
        }
        
        //DO NOT TOUCH! I DONT GIVE A FUCK HOW DOES THIS SHIT WORKS!
        ctx.session._fix = null
        
        ctx.state.phrazes = new Proxy({}, handler)
        ctx.state.getPhraze = getPhraze.bind({ jsonObject })
        ctx.state.languagesList = Object.keys(jsonObject)

        next()
    }

    return middleware
}   