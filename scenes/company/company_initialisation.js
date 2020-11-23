const { Keyboard, Key } = require('telegram-keyboard')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

module.registerScene('company_initialisation_name', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_company_name_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let name = ctx.message.text
        ctx.session.companyName = name

        ctx.scene.enter('company_initialisation_description')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_company_name_unknown
        await ctx.reply(phraze)
    })

}) 

module.registerScene('company_initialisation_description', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_company_description_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let text = ctx.message.text
        let msgEntities = ctx.message.entities || []

        ctx.session.companyDescription = text
        ctx.session.companyDescriptionEntities = msgEntities

        ctx.scene.enter('company_initialisation_contacts')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_company_contacts_unknown
        await ctx.reply(phraze)
    })

}) 

module.registerScene('company_initialisation_contacts', function() {

    this.enter(async (ctx) => {
        
        let phraze = ctx.state.phrazes.settings_company_contacts_greeting
        await ctx.reply(phraze, Keyboard.remove())
    })

    this.on('text', async (ctx) => {

        let text = ctx.message.text
        let msgEntities = ctx.message.entities || []

        ctx.session.companyContacts = text
        ctx.session.companyContactsEntities = msgEntities

        ctx.scene.enter('company_initialisation_final')
    })

    this.other(async (ctx) => {

        let phraze = ctx.state.phrazes.settings_company_contacts_unknown
        await ctx.reply(phraze)
    })

}) 

module.registerScene('company_initialisation_final', function() {

    this.enter((ctx) => {

        const db = ctx.state.db
        let userId = ctx.state.userId
        let isCompanyRegistered = db.get('companies').find({ id: userId }).value() !== undefined;
        
        if(!isCompanyRegistered) {
            db.get('companies').push({ id: userId }).write()
        }

        let data = {
            name: ctx.session.companyName,
            contactInfo: ctx.session.companyContacts,
            contactInfoEntities: ctx.session.companyContactsEntities || [],
            description: ctx.session.companyDescription,
            descriptionEntities: ctx.session.companyDescriptionEntities || [],
            verified: false
        }

        if(db.get('companies').find({ id: userId }).value().cardsIds !== undefined) {}
        else {
            data['cardsIds'] = []
        }

        Object.keys(data).forEach((dbField) => {
            db.get('companies').find({ id: userId }).assign({ [dbField]: data[dbField] }).write()
        })

        ctx.session.companyName                = null
        ctx.session.companyContacts            = null
        ctx.session.companyContactsEntities    = null
        ctx.session.companyDescription         = null
        ctx.session.companyDescriptionEntities = null

        ctx.scene.enter('company_profile')
    })

})