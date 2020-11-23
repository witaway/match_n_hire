const { Keyboard, Key } = require('telegram-keyboard')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const sendPrettyCard = require('./send_pretty_card')

module.registerScene('company_card', function() {

    this.enter(async (ctx) => {

        const cardId = ctx.session.currentCardId
        await sendPrettyCard(ctx, cardId)

        let menu = ''
        menu += '1. ' + ctx.state.phrazes.company_card_matching + '\n'
        menu += '2. ' + ctx.state.phrazes.company_card_settings + '\n'
        menu += '3. ' + ctx.state.phrazes.company_card_delete   + '\n'
        menu += '4. ' + ctx.state.phrazes.go_back_button        + '\n'
        
        let kb = Keyboard.reply(['1', '2', '3', '4'])

        await ctx.reply(menu, kb)
    })

    this.on('text', (ctx) => {

        const text = ctx.message.text
        
        const db = ctx.state.db
        const cardId = ctx.session.currentCardId

        let card = db.get('cards').find({ id: cardId }).value()
        let company = db.get('companies').find({ id: card.companyOwnerId }).value()
        
        if(text === '1') {
            ctx.scene.enter('company_matching')
        } else
        if(text === '2') {
            ctx.session.initCardCompanyOwnerId = company.id 
            ctx.session.initCardId = cardId
            ctx.scene.enter('company_newcard')
        } else 
        if(text === '3') {
            company.cardsIds = company.cardsIds.filter((x) => x != cardId)
            db.get('companies').find({ id: card.companyOwnerId }).assign({ 'cardsIds': company.cardsIds }).write()
            db.get('cards').remove({ id: cardId }).write()
            ctx.scene.enter('company_cards_list')
        } else 
        if(text === '4') {
            ctx.scene.enter('company_cards_list')
        } else {
            ctx.reply(ctx.state.phrazes.no_such_variant)    
        }
    })

    this.other((ctx) => {
        ctx.scene.enter(ctx.state.phrazes.no_such_variant)
    })

})

// 1. Matching
// 2. Fill up data again
// 3. Delete card
// 4. Go back