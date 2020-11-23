const { Keyboard } = require("telegram-keyboard");

module.registerScene('auth', function() {
    
    this.enter(async (ctx) => {
        
        let db = ctx.state.db
        let userId = ctx.state.userId
        
        console.log(userId)

        let isUserRegistered    = db.get('users').find({ id: userId }).value() !== undefined;
        let isCompanyRegistered = db.get('companies').find({ id: userId }).value() !== undefined;

        if(isUserRegistered) {
            await ctx.scene.enter('auth_nice_to_see_ya_again_user')
        } else
        if(isCompanyRegistered) {
            await ctx.scene.enter('auth_nice_to_see_ya_again_company')
        } else {
            await ctx.scene.enter('auth_choose_company_or_user')
        }
    })

})

module.registerScene('auth_choose_company_or_user', function() {

    this.enter((ctx) => {

        const phraze = 'I am ...'
        const kb = Keyboard.reply(['Job seeker', 'Employer'])

        ctx.reply(phraze, kb)
    })

    this.on('text', (ctx) => {

        const text = ctx.message.text
        if(text === 'Job seeker') {
            ctx.scene.enter('auth_register_user')
        } else 
        if(text === 'Employer') {
            ctx.scene.enter('auth_register_company')
        } else {
            ctx.reply(ctx.state.phrazes.no_such_variant)
        }

    })

    this.other((ctx) => {
        ctx.scene.reply(ctx.state.phrazes.no_such_variant)
    })

})

module.registerScene('auth_nice_to_see_ya_again_user', function(ctx) {

    this.enter(async (ctx) => {

        let phrase = ctx.state.phrazes.hello_again_greeting
        let kb = Keyboard.reply([ ctx.state.phrazes.hello_again_button ])
        
        await ctx.reply(phrase, kb)
    })

    this.other(async (ctx) => {
        ctx.scene.enter('profile')
    })

})

module.registerScene('auth_nice_to_see_ya_again_company', function(ctx) {

    this.enter(async (ctx) => {
        await ctx.scene.enter('company_profile')        
    })

})




module.registerScene('auth_register_user', function() {

    this.enter(async (ctx) => {
        
        await ctx.reply(ctx.state.phrazes.registration_start, Keyboard.remove())
        
        ctx.session.settings = {
            steps: ['settings_name', 'settings_age', 'settings_description', 'settings_stack', 
                    'settings_photo', 'settings_location', 'settings_resume', 'settings_contacts'],
            afterscene: 'profile'
        }

        await ctx.scene.enter('settings')
    })  

})      

module.registerScene('auth_register_company', function() {

    this.enter(async (ctx) => {
        
        await ctx.scene.enter('company_initialisation_name')
    })  

})      


// ctx.state.db.get('posts')
            // .filter({published: true})
            // .sortBy('views')
            // .take(5)
            // .value()
