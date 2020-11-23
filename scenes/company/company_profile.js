const { Keyboard, Key } = require('telegram-keyboard')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

module.registerScene('company_profile', function() {

    this.enter(async (ctx) => {

        const db = ctx.state.db
        const userId = ctx.state.userId

        const profile = db.get('companies').find({ id: userId })
        
        const name        = profile.get('name').value()
        const description = profile.get('description').value()
        const contacts    = profile.get('contactInfo').value()
        const verified    = profile.get('verified').value()
    
        let descriptionEntities = profile.get('descriptionEntities').value()
        let contactsEntities    = profile.get('contactInfoEntities').value()

        const status_names = {
            true: ctx.state.phrazes.company_verified_status,//'Status: verified',
            false: ctx.state.phrazes.company_unverified_status//'Status: unverified'
        }

        let prefix1 = `${name}\n`
        let prefix2 = `${status_names[verified]}\n\n`
        let prefix3 = `${description}\n\n`
        let prefix4 = `${contacts}`

        descriptionEntities = descriptionEntities.map((val) => {
            let result = Object.assign({}, val)
            result.offset += prefix1.length + prefix2.length
            return result
        })

        contactsEntities = contactsEntities.map((val) => {
            let result = Object.assign({}, val)
            result.offset += prefix1.length + prefix2.length + prefix3.length
            return result
        })

        msgEntities = [...descriptionEntities, ...contactsEntities]

        //console.log(msgEntities)

        msgEntities.push({ type: 'bold', offset: 0, length: prefix1.length })
        msgEntities.push({ type: 'italic', offset: prefix1.length, length: prefix2.length })
        
        let text = prefix1 + prefix2 + prefix3 + prefix4

        await ctx.reply(text, { entities: msgEntities })

        ///-----------------------

        let menu = ''
        menu += '1. ' + ctx.state.phrazes.company_profile_cards        + '\n'
        menu += '2. ' + ctx.state.phrazes.company_profile_reinit       + '\n'
        menu += '3. ' + ctx.state.phrazes.company_profile_verification + '\n'
        
        let kb = Keyboard.reply(['1', '2', '3'])

        await ctx.reply(menu, kb)
    })

    this.on('text', async (ctx) => {

        const text = ctx.message.text

        if(text === '1') {
            await ctx.scene.enter('company_cards_list')
        } else
        if(text === '2') {
            await ctx.scene.enter('company_initialisation_name')
        } else 
        if(text === '3') {
            await ctx.scene.enter('company_verification')
        } else {
            await ctx.reply(ctx.state.phrazes.no_such_variant)
        }

    })

    this.other(async (ctx) => {
        await ctx.reply(ctx.state.phrazes.no_such_variant)
    })

})

/*
    *Sintracorp inc.*
    _status: unverified_

    Company that cursed
    and cursed and cursed

    +375(33)652-69-26
*/

/*
    1. Company cards
    2. Change profile info
    3. Verification
*/