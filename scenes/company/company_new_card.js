const { Keyboard } = require("telegram-keyboard")
const Key = require("telegram-keyboard/lib/key")

module.registerScene('company_newcard', function() {

    this.enter((ctx) => {

        const db = ctx.state.db
        
        //Added this string for autocomplete.
        ctx.session.initCard = {}
        ctx.session.initCard.companyOwnerId = ctx.session.initCardCompanyOwnerId
        ctx.session.initCard.id = ctx.session.initCardId
        
        if(ctx.session.initCardCompanyOwnerId == undefined || ctx.session.initCardCompanyOwnerId == null) {
            throw "ctx.session.initCardCompanyOwnerId - MUST BE SET"
        }

        if(ctx.session.initCardId == undefined || ctx.session.initCardId == null) {
            throw "ctx.session.initCardId - MUST BE SET"
        }

        ctx.scene.enter('company_newcard_label')
        // Then company_newcard_description
        // Then company_newcard_photo
        // Then company_newcard_file
        // Then company_newcard_contacts
    })
})

module.registerScene('company_newcard_label', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_company_newcard_label_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let label = ctx.message.text

        if(label.indexOf('\n') > -1) {
            ctx.reply(ctx.state.phrazes.settings_company_newcard_label_more_than_1line)
        } else {
            ctx.session.initCard.label = label
        }

        ctx.scene.enter('company_newcard_description')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_company_newcard_label_unknown
        await ctx.reply(phraze)
    })

}) 

module.registerScene('company_newcard_description', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_company_newcard_description_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let text = ctx.message.text
        let msgEntities = ctx.message.entities || []

        ctx.session.initCard.description = text
        ctx.session.initCard.descriptionEntities = msgEntities

        ctx.scene.enter('company_newcard_photo')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_company_newcard_description_greeting
        await ctx.reply(phraze)
    })

}) 

module.registerScene('company_newcard_photo', function() {

    this.enter(async (ctx) => {
  
        let kb = Keyboard.reply([ ctx.state.phrazes.settings_company_newcard_photo_dont_send ])
        let phraze = ctx.state.phrazes.settings_company_newcard_photo_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {
        
        let text = ctx.message.text
        
        if(text === ctx.state.phrazes.settings_company_newcard_photo_dont_send) {
            ctx.scene.enter('company_newcard_file')
        } 
        else {
            let phraze = ctx.state.phrazes.settings_company_newcard_photo_unknown
            await ctx.reply(phraze)
        }
    })

    this.on('photo', async (ctx) => {

        let photo = ctx.message.photo.last.file_id
        ctx.session.initCard.photo = photo
        
        ctx.scene.enter('company_newcard_file')
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_company_newcard_photo_unknown
        await ctx.reply(phraze)
    })
})

module.registerScene('company_newcard_file', function() {

    this.enter(async (ctx) => {
  
        let kb = Keyboard.reply([ ctx.state.phrazes.settings_company_newcard_document_dont_send ])
        let phraze = ctx.state.phrazes.settings_company_newcard_document_greeting
        await ctx.reply(phraze, kb)
    })

    this.on('text', async (ctx) => {
        
        let text = ctx.message.text
        
        if(text === ctx.state.phrazes.settings_company_newcard_document_dont_send) {
            ctx.scene.enter('company_newcard_final')
        } 
        else {
            let phraze = ctx.state.phrazes.settings_company_newcard_document_unknown
            await ctx.reply(phraze)
        }
    })

    this.on('document', async (ctx) => {

        let file = ctx.message.document.file_id
        ctx.session.initCard.document = file
        
        ctx.scene.enter('company_newcard_final')
    })

    this.other(async (ctx) => {
        let phraze = ctx.state.phrazes.settings_company_newcard_document_unknown
        await ctx.reply(phraze)
    })
})

module.registerScene('company_newcard_final', function() {

    this.enter((ctx) => {
        
        const db = ctx.state.db


        let isCardCreated = db.get('cards').find({ id: ctx.session.initCard.id }).value() !== undefined;
        
        if(!isCardCreated) {
            db.get('cards').push({ id: ctx.session.initCard.id }).write()
        }

        let data = ctx.session.initCard

        Object.keys(data).forEach((dbField) => {
            db.get('cards').find({ id: ctx.session.initCard.id }).assign({ [dbField]: data[dbField] }).write()
        })

        const cardsList = db.get('companies').find({ id: ctx.state.userId }).value().cardsIds || []
        if(cardsList.indexOf(ctx.session.initCard.id) === -1) {
            cardsList.push(ctx.session.initCard.id)
        }
        db.get('companies').find({ id: ctx.state.userId }).assign({ 'cardsIds': cardsList }).write()

        ///FOR company_card
        ctx.session.currentCardId = ctx.session.initCardId

        ctx.session.initCardCompanyOwnerId = null
        ctx.session.initCardId = null
        ctx.session.initCard = null

        ctx.scene.enter('company_card')
    })

})