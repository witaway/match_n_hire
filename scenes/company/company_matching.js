const { Keyboard, Key } = require('telegram-keyboard')

const sendPrettyUser = require('../user/send_pretty_user')

module.registerScene('company_matching', function() {
    
    this.enter(async (ctx) => {
        
        const db = ctx.state.db
        const cardId = ctx.session.currentCardId

        const kb = Keyboard.reply([
            ctx.state.phrazes.matching_like, 
            ctx.state.phrazes.matching_dislike, 
            ctx.state.phrazes.matching_complaint, 
            ctx.state.phrazes.matching_zzz])['reply_markup']


        const likeToUs = db.get('likes').find({ "type": "user_to_card", "to": cardId, "status": "pending" }).value()
        const likeMututual = db.get('likes').find({ "type": "card_to_user", "from": cardId, "status": "mutual" }).value()

        if(likeMututual !== null && likeMututual !== undefined) {
        
            ctx.session.matching_mode = 'seeing_mutual'
            const user = db.get('users').find({ "id": likeMututual.to }).value()

            ctx.session.like_id = likeMututual.id

            const goNextKb = Keyboard.reply([ 'Cool! Go next!' ])

            await ctx.reply('Your like is mutual!', goNextKb)
            await sendPrettyUser(ctx, user.id, goNextKb)
            await ctx.reply(user.contactInfo, { 'entities': user.contactInfoEntities })

        } else
        
        if(likeToUs !== null && likeToUs !== undefined) {

            ctx.session.matching_mode = 'like_answer'
            ctx.session.like_id = likeToUs.id
            
            const user = db.get('users').find({ "id": likeToUs.from }).value()

            await ctx.reply('You liked by:')
            await sendPrettyUser(ctx, user.id, kb)

        } else {

            ctx.session.matching_mode = 'liking'

            //const userId = "402526102:402526102"
            
            ///userId - ?
                const random_item = function(items) {
                    return items[Math.floor(Math.random()*items.length)] 
                }
                const userId = random_item(db.get('users').value().map((val) => val.id))
            ///
            
            ctx.session.user_id = userId
            ctx.session.card_id = cardId
            
            await sendPrettyUser(ctx, userId, kb)
        }
    })

    this.on('text', async (ctx) => {

        const text = ctx.message.text
        const db = ctx.state.db

        if(ctx.session.matching_mode === 'seeing_mutual') {
            db.get('likes').find({ "id": ctx.session.like_id }).assign({
                "status": "mutual_seen"
            }).write()
            await ctx.scene.enter('company_matching')
            return;
        }

        if(text === ctx.state.phrazes.matching_zzz) {
            await ctx.scene.enter('company_card')
            return
        }

        if(text === ctx.state.phrazes.matching_complaint) {
            await ctx.scene.enter('company_complaint')
            return
        }

        if(ctx.session.matching_mode === 'like_answer') {

            const like = db.get('likes').find({ "id": ctx.session.like_id }).value()
            const user = db.get('users').find({ "id": like.from }).value()

            if(text === ctx.state.phrazes.matching_like) {
            
                await ctx.reply('Cool! These are contacts!')
                await ctx.reply(user.contactInfo, { 'entities': user.contactInfoEntities })                    
                
                db.get('likes').find({ "id": ctx.session.like_id })
                    .assign({ "status": "mutual" }).write()

                ctx.scene.enter('company_matching')
            } 

            if(text === ctx.state.phrazes.matching_dislike) {
                db.get('likes').find({ "id": ctx.session.like_id })
                    .assign({ "status": "not_mutual" }).write()
                ctx.scene.enter('company_matching')
            }

        } else {
            
            if(text === ctx.state.phrazes.matching_like) {
                
                const x = db.get('likes').find({
                    "type": "card_to_user",
                    "from": ctx.session.card_id,
                    "to": ctx.session.user_id,
                    "status": "pending"
                }).value()
                
                if(!(x !== undefined && x !== null)) {
                    const generatedLikeId = Math.trunc(Math.random()*100000000000000000)
                    db.get('likes').push({
                        "id": generatedLikeId,
                        "type": "card_to_user",
                        "from": ctx.session.card_id,
                        "to": ctx.session.user_id,
                        "status": "pending"
                    }).write()
                }
                ctx.scene.enter('company_matching')
            }

            if(text === ctx.state.phrazes.matching_dislike) {
                ctx.scene.enter('company_matching')
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
  
    { //When card liked => Changes to mutual, shows to user and then deletes
      //When card didn't liked => "not mutual"

        "type": "user_to_card",
        "from": "402526102:402526102",  
        "to": 54508138365333830,
        "status": "mutual"
    },
]

*/