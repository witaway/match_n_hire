const { Keyboard, Key } = require('telegram-keyboard')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

module.registerScene('settings', function() {
    
    this.enter((ctx) => {
    
        if(ctx.session.settings == null) {
            ctx.session.settings = {}
        }

        //Initiate first step
        if(ctx.session.settings.curstep == null) {

            if(ctx.session.settings.steps == null) {
                throw "settings.steps MUST be set in ctx.session!";
            }
            if(ctx.session.settings.afterscene == null) {
                throw "settings.afterscene MUST be set in ctx.session!";
            }

            if(ctx.session.settings.goBackEnabled === true) {
                if(ctx.session.settings.goBackScene == null) {
                    throw "settings.goBackScene MUST be set in ctx.session when settings.goBackScene is set to true"
                }
            }

            if(ctx.session.settings.goBackEnabled == null) {
                ctx.session.settings.goBackEnabled = false
            }

            ctx.session.settings.curstep = 0;
            ctx.session.settings.data = {}

        } else { //This is not first step
            ctx.session.settings.curstep++;
            //Is this step was last
            if(ctx.session.settings.curstep == ctx.session.settings.steps.length) {

                const db = ctx.state.db

                let afterscene = ctx.session.settings.afterscene
                let data = ctx.session.settings.data
                ctx.session.settings = null

                let userId = ctx.state.userId
                let isUserRegistered = db.get('users').find({ id: userId }).value() !== undefined;
                
                if(!isUserRegistered) {
                    db.get('users').push({ id: userId }).write()
                }

                Object.keys(data).forEach((dbField) => {
                    db.get('users').find({ id: userId }).assign({ [dbField]: data[dbField] }).write()
                })
                
                ctx.scene.enter(afterscene)
                return;
            }
        }
        
        //Go to this step
        ctx.scene.enter(ctx.session.settings.steps[ctx.session.settings.curstep]);
    })
})

// ['settings_name', 'settings_age', 'settings_description', 'settings_stack', 
//  'settings_photo', 'settings_location', 'settings_resume', 'settings_contacts']
// + 'language' //not ctx.state.db, but ctx.session.language

module.registerScene('settings_name', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_name_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let name = ctx.message.text
        ctx.session.settings.data.name = name
        ctx.session.settings.data.username = ctx.message.from.username

        ctx.scene.enter('settings')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_name_unknown
        await ctx.reply(phraze)
    })

})

module.registerScene('settings_age', function() {

    this.enter(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_age_greeting
        await ctx.reply(phraze)
    })

    this.on('text', async (ctx) => {

        let age = ctx.message.text

        if(isNaN(+age)) {
            let phraze = ctx.state.phrazes.settings_age_not_int
            await ctx.reply(phraze)
        } else {
            age = +age
            if(age < 18) {
                let phraze = ctx.state.phrazes.settings_age_young
                await ctx.reply(phraze)
            } else 
            if(age > 100) {
                let phraze = ctx.state.phrazes.settings_age_old
                await ctx.reply(phraze)
            } else {
                ctx.session.settings.data.age = age
                ctx.scene.enter('settings')
            }
        }
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_age_unknown
        await ctx.reply(phraze)
    })

})

module.registerScene('settings_description', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_description_greeting
        let kb = ctx.session.settings.goBackEnabled ? Keyboard.reply( [ctx.state.phrazes.go_back_button] ) : Keyboard.remove()
        
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {

        let description = ctx.message.text
        let msgEntities = ctx.message.entities || []

        if(description > 900) description = description.slice(0, 900)

        if(ctx.session.settings.goBackEnabled && description === ctx.state.phrazes.go_back_button) {
            await ctx.state.abortSettings(ctx.session.settings.goBackScene)
        } else {
            ctx.session.settings.data.description = description
            ctx.session.settings.data.descriptionMsgEntities = msgEntities 
            await ctx.scene.enter('settings')
        }
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_description_unknown
        await ctx.reply(phraze)
    })

})

module.registerScene('settings_stack', function() {

    this.enter(async (ctx) => {
    
        let phraze = ctx.state.phrazes.settings_stack_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {
        
        let stackList = ctx.message.text.toLowerCase().split(' ')
        ctx.session.settings.data.stack = stackList
        
        ctx.scene.enter('settings')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_stack_unknown
        await ctx.reply(phraze)
    })

})

module.registerScene('settings_photo', function() {

    this.enter(async (ctx) => {
  
        let kb = ctx.session.settings.goBackEnabled ? Keyboard.reply([ ctx.state.phrazes.go_back_button ]) 
                                                    : Keyboard.reply([ ctx.state.phrazes.settings_photo_button_dont_send ]);
        let phraze = ctx.state.phrazes.settings_photo_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {
        
        let text = ctx.message.text
        
        if(text === ctx.state.phrazes.settings_photo_button_dont_send) {
            await ctx.scene.enter('settings')
        } else 
        
        if(ctx.session.settings.goBackEnabled && text === ctx.state.phrazes.go_back_button) {
            await ctx.state.abortSettings(ctx.session.settings.goBackScene)
        } 
        
        else {
            let phraze = ctx.state.phrazes.settings_photo_unknown
            await ctx.reply(phraze)
        }
    })

    this.on('photo', async (ctx) => {

        let photo = ctx.message.photo.last.file_id
        ctx.session.settings.data.photo = photo

        ctx.scene.enter('settings')
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_photo_unknown
        await ctx.reply(phraze)
    })
})

module.registerScene('settings_location', function() {

    this.enter(async (ctx) => {
        
        let kb = Extra.markup((markup) => {
            return markup.resize()
                .keyboard([
                markup.locationRequestButton('Send location')
            ])
        })

        let phraze = ctx.state.phrazes.settings_location_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('location', async (ctx) => {
    
        let longitude = ctx.message.location.longitude
        let latitude  = ctx.message.location.latitude

        ctx.session.settings.data.location = {
            longitude, latitude
        }

        ctx.scene.enter('settings')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_location_unknown
        await ctx.reply(phraze)
    })
})

module.registerScene('settings_resume', function() {

    this.enter(async (ctx) => {
  
        let kb = ctx.session.settings.goBackEnabled ? Keyboard.reply([ ctx.state.phrazes.go_back_button ]) 
                                                    : Keyboard.reply([ ctx.state.phrazes.settings_resume_button_dont_send ]);
        let phraze = ctx.state.phrazes.settings_resume_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {
        
        let text = ctx.message.text
        
        if(text === ctx.state.phrazes.settings_resume_button_dont_send) {
            ctx.scene.enter('settings')
        } 
        
        else if (ctx.session.settings.goBackEnabled && text === ctx.state.phrazes.go_back_button) {
            await ctx.state.abortSettings(ctx.session.settings.goBackScene)
        } 
        
        else {
            let phraze = ctx.state.phrazes.settings_resume_unknown
            await ctx.reply(phraze)
        }
    })

    this.on('document', async (ctx) => {

        let resume = ctx.message.document.file_id
        ctx.session.settings.data.resume = resume

        ctx.scene.enter('settings')
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_resume_unknown
        await ctx.reply(phraze)
    })
})

module.registerScene('settings_contacts', function() {

    this.enter(async (ctx) => {
        
        let kb = ctx.session.settings.goBackEnabled ? Keyboard.reply([ ctx.state.phrazes.go_back_button ]) 
                                                    : Keyboard.remove()
        
        let phraze = ctx.state.phrazes.settings_contacts_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {

        const contactInfo = ctx.message.text
        const msgEntities = ctx.message.entities || []

        if(ctx.session.settings.goBackEnabled && contactInfo === ctx.state.phrazes.go_back_button) {
            await ctx.state.abortSettings(ctx.session.settings.goBackScene)
        }
        else {
            ctx.session.settings.data.contactInfo = contactInfo
            ctx.session.settings.data.contactInfoMsgEntities = msgEntities
            await ctx.scene.enter('settings')
        }
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_contacts_unknown
        await ctx.reply(phraze)
    })

})

module.registerScene('settings_language', function() {

    this.enter(async (ctx) => {
  

        let btn_texts = ctx.state.languagesList.map((val) => {
            return [ ctx.state.getPhraze(val, 'settings_language_button') ]
        })

        let kb = Keyboard.reply(btn_texts);
        let phraze = ctx.state.phrazes.settings_language_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {

        let reverse = {} 
        let btn_texts = ctx.state.languagesList.map((val) => {
            let text = ctx.state.getPhraze(val, 'settings_language_button')
            reverse[text] = val
            return text
        })

        let text = ctx.message.text

        if(btn_texts.includes(text)) {
            
            let language = reverse[text]
            ctx.session.language = language

            await ctx.scene.enter('settings')

        } else {
            await ctx.reply(ctx.state.phrazes.settings_language_doesnt_exist)
        }

    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_language_unknown
        await ctx.reply(phraze)
    })
})
