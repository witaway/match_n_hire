const { Keyboard, Key } = require('telegram-keyboard')

module.registerScene('company_complaint', function() {

    this.enter((ctx) => {

        const kb = Keyboard.reply(['Go back']) 
        ctx.replyWithMarkdownV2("_Coming soon\\!_", kb)
    })

    this.other((ctx) => {
        ctx.scene.enter('company_matching')
    })

})