const { Keyboard, Key } = require('telegram-keyboard')

module.registerScene('company_verification', function() {

    this.enter((ctx) => {
        ctx.replyWithMarkdownV2('Coming soon\\!\n_Enter anything to go back\\._', Keyboard.remove())
    })

    this.other((ctx) => {
        ctx.scene.enter('company_profile')
    })

})