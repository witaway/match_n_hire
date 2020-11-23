const { Keyboard, Key } = require('telegram-keyboard')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

module.registerScene('company_cards_list', function() {

    this.enter(async (ctx) => {

        const db = ctx.state.db
        const userId = ctx.state.userId
    
        const cardsIds = db.get('companies').find({ id: userId }).value().cardsIds || []
        const cards = db.get('cards')
    
        let text = `${ctx.state.phrazes.company_cards_list_greeting}\n\n`
        for(let i = 0; i < cardsIds.length; i++) {
            const label = db.get('cards').find({ id: cardsIds[i] }).value().label
            text += `${i + 1}. ${label}\n`
        }
        
        let menu_text
        if(cardsIds.length === 0) {
            text += ctx.state.phrazes.company_cards_list_no_cards
            menu_text = ctx.state.phrazes.company_cards_menu_without_number
        } else {
            menu_text = ctx.state.phrazes.company_cards_menu_full
        }

        await ctx.reply(text)
        await ctx.reply(`${menu_text}`, Keyboard.reply([[ctx.state.phrazes.company_cards_new_card_button], [ctx.state.phrazes.go_back_button]]))
    })

    this.on('text', async (ctx) => {

        let text = ctx.message.text

        if(isNaN(+text)) {
            if(text === ctx.state.phrazes.go_back_button) {
                await ctx.scene.enter('company_profile')
            } else
            if(text === ctx.state.phrazes.company_cards_new_card_button) {
                ctx.session.initCardCompanyOwnerId = ctx.state.userId
                ctx.session.initCardId = Math.trunc(Math.random()*100000000000000000)
                await ctx.scene.enter('company_newcard')
            } else {
                await ctx.reply(ctx.state.phrazes.no_such_variant)
            }
        } else {

            let number = +text - 1

            const db = ctx.state.db
            const userId = ctx.state.userId
            const cardsIds = db.get('companies').find({ id: userId }).value().cardsIds || []
        
            if(number >= 0 && number < cardsIds.length) {
                ctx.session.currentCardId = cardsIds[number]
                await ctx.scene.enter('company_card')
            } else {
                await ctx.reply(ctx.state.phrazes.company_cards_incorrect_number)
            }
        }

    })

    this.other(async (ctx) => {
        await ctx.reply(ctx.state.phrazes.no_such_variant)
    })

})
