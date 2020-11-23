const { Keyboard, Key } = require('telegram-keyboard')

const sendPrettyUser = require('./send_pretty_user')

module.registerScene('profile', function() {
    
    this.enter(async (ctx) => {
        
        const db = ctx.state.db
        const userId = ctx.state.userId

        await ctx.reply(ctx.state.phrazes.profile_greeting)
        await sendPrettyUser(ctx, userId, {})

        let menu = ''
        menu += '1. ' + ctx.state.phrazes.profile_settings_1           + '\n'
        menu += '2. ' + ctx.state.phrazes.profile_pic_or_resume_2      + '\n'
        menu += '3. ' + ctx.state.phrazes.profile_change_description_3 + '\n'
        menu += '4. ' + ctx.state.phrazes.profile_contacts_4           + '\n'
        menu += '5. ' + ctx.state.phrazes.profile_start_matching_5     + '\n'

        let kb = Keyboard.reply(['1', '2', '3', '4', '5'])

        await ctx.reply(menu, kb)

    })

    this.on('text', async (ctx) => {
        
        const text = ctx.message.text

        if(text === '1') {
            ctx.session.settings = {
                steps: ['settings_name', 'settings_age', 'settings_description', 'settings_stack', 
                        'settings_photo', 'settings_location', 'settings_resume', 'settings_contacts'],
                afterscene: 'profile'
            }
            await ctx.scene.enter('settings')    
        } else

        if(text === '2') {
            await ctx.scene.enter('profile_change_pic_or_resume')
        } else

        if(text === '3') {
            ctx.session.settings = {
                steps: [ 'settings_description' ],
                afterscene: 'profile',
                goBackEnabled: true,
                goBackScene: 'profile'
            }
            await ctx.scene.enter('settings')  
        } else 

        if(text === '4') {
            await ctx.scene.enter('profile_contacts')
        } else

        if(text === '5') {
            await ctx.scene.enter('matching')
        } 
        
        else {
            await ctx.reply(ctx.state.phrazes.no_such_variant)
        }

    })

})

module.registerScene('profile_change_pic_or_resume', function() {

    this.enter(async (ctx) => {
        const kb = Keyboard.reply([ [ctx.state.phrazes.profile_pic_or_resume_photo_button, ctx.state.phrazes.profile_pic_or_resume_resume_button], 
                                    [ctx.state.phrazes.go_back_button] ])
        await ctx.reply(ctx.state.phrazes.profile_pic_or_resume_choose, kb)
    })

    this.on('text', async (ctx) => {

        const text = ctx.message.text
        
        if(text === ctx.state.phrazes.profile_pic_or_resume_photo_button) {

            ctx.session.settings = {
                steps: [ 'settings_photo' ],
                afterscene: 'profile',
                goBackEnabled: true,
                goBackScene: 'profile_change_pic_or_resume'
            }
            await ctx.scene.enter('settings')  
        
        } else 
        if(text === ctx.state.phrazes.profile_pic_or_resume_resume_button) {

            ctx.session.settings = {
                steps: [ 'settings_resume' ],
                afterscene: 'profile',
                goBackEnabled: true,
                goBackScene: 'profile_change_pic_or_resume'
            }
            await ctx.scene.enter('settings')  
        
        } else
        if(text === ctx.state.phrazes.go_back_button) {
            await ctx.scene.enter('profile')
        } else {
            await ctx.reply(ctx.state.phrazes.no_such_variant)
        }

    })

    this.other(async (ctx) => {
        await ctx.reply(ctx.state.phrazes.no_such_variant)
    })

})

module.registerScene('profile_contacts', function() {

    this.enter(async (ctx) => {

        const db        = ctx.state.db
        const userId    = ctx.state.userId

        const profile   = db.get('users').find({ id: userId })
        const contacts  = profile.get('contactInfo').value()
        
        const prefix    = ctx.state.phrazes.profile_contacts_your_data + '\n\n'
        const text      = prefix + contacts

        let msgEntities = profile.get('contactInfoMsgEntities').value() || []
        msgEntities = msgEntities.map((val) => {
            let result = Object.assign({}, val)
            result.offset += prefix.length
            return result
        })

        const kb = Keyboard.reply([ ctx.state.phrazes.change_button, ctx.state.phrazes.go_back_button ])['reply_markup']

        await ctx.reply(text, { 'entities': msgEntities, 'reply_markup': kb })
    })

    this.on('text', async (ctx) => {

        const text = ctx.message.text
        
        if(text === ctx.state.phrazes.change_button) {

            ctx.session.settings = {
                steps: [ 'settings_contacts' ],
                afterscene: 'profile_contacts',
                goBackEnabled: true,
                goBackScene: 'profile_contacts'
            }
            await ctx.scene.enter('settings')  
        
        } else
        
        if(text === ctx.state.phrazes.go_back_button) {
            await ctx.scene.enter('profile')
        } 
        
        else {
            await ctx.reply(ctx.state.phrazes.no_such_variant)
        }

    })

    this.other(async (ctx) => {
        await ctx.reply(ctx.state.phrazes.no_such_variant)
    })

})

// 1. Заполнить анкету заново
// 2. Извменить фото/резюме анкеты
// 3. Изменить текст анкеты
// 4. Контактные данные
// 5. Перейти к метчингу