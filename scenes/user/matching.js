const { Keyboard } = require('telegram-keyboard')

const sendPrettyCard = require('../company/send_pretty_card')

module.registerScene('matching', function() {
    
    this.enter(async (ctx) => {
        
        ctx.session.cheatCounter++

        const db = ctx.state.db
        const userId = ctx.state.userId

        const kb = Keyboard.reply([
            ctx.state.phrazes.matching_like, 
            ctx.state.phrazes.matching_dislike, 
            ctx.state.phrazes.matching_complaint, 
            ctx.state.phrazes.matching_zzz])['reply_markup']

        if(userId === "402526102:402526102" && ctx.session.cheatCounter === 4) {
            db.get('likes').push({
                "id": "1",
                "type": "user_to_card",
                "from": "402526102:402526102",
                "to": 1,
                "status": "mutual"
            }).write()
        }

        const likeToUs = db.get('likes').find({ "type": "card_to_user", "to": userId, "status": "pending" }).value()
        const likeMututual = db.get('likes').find({ "type": "user_to_card", "from": userId, "status": "mutual" }).value()

        if(likeMututual !== null && likeMututual !== undefined) {
        
            ctx.session.matching_mode = 'seeing_mutual'
            const card = db.get('cards').find({ "id": likeMututual.to }).value()
            const company = db.get('companies').find({ "id": card.companyOwnerId }).value()

            ctx.session.like_id = likeMututual.id

            const goNextKb = Keyboard.reply([ 'Cool! Go next!' ])

            await ctx.reply('Your like is mutual!', goNextKb)
            await sendPrettyCard(ctx, card.id, goNextKb)
            await ctx.reply(company.contactInfo, { 'entities': company.contactInfoEntities })            

        } else
        
        if(likeToUs !== null && likeToUs !== undefined) {

            ctx.session.matching_mode = 'like_answer'
            ctx.session.like_id = likeToUs.id
            
            const card = db.get('cards').find({ "id": likeToUs.from }).value()

            await ctx.reply('You liked by:')
            await sendPrettyCard(ctx, card.id, kb)

        } else {

            ctx.session.matching_mode = 'liking'

            //const cardId = 54508138365333830

            ///cardId - ?
                const random_item = function(items) {
                    return items[Math.floor(Math.random()*items.length)] 
                }            
                let cardId = random_item(db.get('cards').value().map((val) => val.id))
            ///

            if(userId === "402526102:402526102" && ctx.session.cheatCounter === 1) cardId = 1
            if(userId === "402526102:402526102" && ctx.session.cheatCounter === 2) cardId = 2
            if(userId === "402526102:402526102" && ctx.session.cheatCounter === 3) cardId = 3

            ctx.session.card_id = cardId
            
            await sendPrettyCard(ctx, cardId, kb)
        }
    })

    this.on('text', async (ctx) => {

        const text = ctx.message.text
        const db = ctx.state.db

        if(ctx.session.matching_mode === 'seeing_mutual') {
            db.get('likes').find({ "id": ctx.session.like_id }).assign({
                "status": "mutual_seen"
            }).write()
            await ctx.scene.enter('matching')
            return;
        }

        if(text === ctx.state.phrazes.matching_zzz) {
            await ctx.scene.enter('profile')
            return
        }

        if(text === ctx.state.phrazes.matching_complaint) {
            await ctx.scene.enter('complaint')
            return
        }

        if(ctx.session.matching_mode === 'like_answer') {

            const like = db.get('likes').find({ "id": ctx.session.like_id }).value()
            const card = db.get('cards').find({ "id": like.from }).value()
            const company = db.get('companies').find({ "id": card.companyOwnerId }).value()

            if(text === ctx.state.phrazes.matching_like) {
            
                await ctx.reply('Cool! These are contacts!')
                await ctx.reply(company.contactInfo, { 'entities': company.contactInfoEntities })                    
                
                db.get('likes').find({ "id": ctx.session.like_id })
                    .assign({ "status": "mutual" }).write()

                ctx.scene.enter('matching')
            } 

            if(text === ctx.state.phrazes.matching_dislike) {
                db.get('likes').find({ "id": ctx.session.like_id })
                    .assign({ "status": "not_mutual" }).write()
                ctx.scene.enter('matching')
            }

        } else {
            
            if(text === ctx.state.phrazes.matching_like) {
                
                const x = db.get('likes').find({ 
                    "type": "user_to_card",
                    "from": ctx.state.userId,
                    "to": ctx.session.card_id,
                    "status": "pending"
                }).value()
                
                if(!(x !== undefined && x !== null)) {
                    const generatedLikeId = Math.trunc(Math.random()*100000000000000000)
                    db.get('likes').push({
                        "id": generatedLikeId,
                        "type": "user_to_card",
                        "from": ctx.state.userId,
                        "to": ctx.session.card_id,
                        "status": "pending"
                    }).write()
                }
                ctx.scene.enter('matching')
            }

            if(text === ctx.state.phrazes.matching_dislike) {
                ctx.scene.enter('matching')
            }
        }

    })

    this.other((ctx) => {

    })

})

/*

"likes": [
    
    { //When card liked => makes and shows to user
        "type": "card_to_user",
        "from": 54508138365333830,
        "to": "402526102:402526102",
        "status": "pending"
    },
  
    { //When user liked => Changes to mutual, shows to card and then deletes
      //When user didn't liked => "not mutual"
        "type": "card_to_user",
        "from": 54508138365333830,
        "to": "402526102:402526102",
        "status": "mutual"/"not_mutual"/"mutual_seen"
    },
  
    { //When user liked => makes and shows to card
        "type": "user_to_card",
        "from": "402526102:402526102",  
        "to": 54508138365333830,
        "status": "pending"
    },
  --
    { //When card liked => Changes to mutual, shows to user and then deletes
      //When card didn't liked => "not mutual"

        "type": "user_to_card",
        "from": "402526102:402526102",  
        "to": 54508138365333830,
        "status": "mutual"
    },
]

*/