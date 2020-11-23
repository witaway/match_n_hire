require('./make_arrays_great_again');

function decorate(fn, callback_position) {
    return function() {
        let args = [...arguments]
        let callback = args[callback_position];
        let new_callback = (ctx, next) => {
            ctx.state.triggered = true;
            return callback.apply(null, [ctx, next])
        }
        args[callback_position] = new_callback
        return fn.apply(this, args)
    }
}

((function(){
    
    let Module = require('module')
    Module.prototype.registerScene = function(name, constructor) {

        const Scene = require('telegraf/scenes/base')

        if(Object.keys(this.exports).length === 0 && this.exports.constructor === Object) {
            this.exports = []
        }
        
        this.exports.push(new Scene(name))
        
        this.exports.last.enter   = decorate(this.exports.last.enter, 0)
        this.exports.last.on      = decorate(this.exports.last.on, 1)
        this.exports.last.command = decorate(this.exports.last.command, 1)
        this.exports.last.hears   = decorate(this.exports.last.hears, 0)


        this.exports.last.on('document', (ctx) => {
            console.log(ctx.message.document.file_id)    
        })
        

        //Make autochecking of ctx.state.triggered for ctx.other((ctx)=>{...})
        this.exports.last.other = (fn) => {
            this.exports.last.use((ctx, next) => {
                if(!ctx.state.triggered) {
                    fn.apply(this.exports.last, [ctx]);
                }
                next()
            })
        }

        //Make global /start console.log
        this.exports.last.command('/start', (ctx) => {
            ctx.session.settings = {}
            ctx.session.cheatCounter = 0
            ctx.scene.enter('auth')        
        })

        //Apply all commands from constructor
        constructor.apply(this.exports.last);
    }
   
})())