module.exports = async function(ctx, userId, keyboard) {
    
    const db = ctx.state.db
    
    const profile = db.get('users').find({ id: userId })
    
    const name        =      profile.get('name')        .value()
    const age         = '' + profile.get('age')         .value()
    const description =      profile.get('description') .value()

    let msgEntities = profile.get('descriptionMsgEntities').value()

    const stack       = profile.get('stack').value()
    const stackText   = stack.join(', ')

    const photoId     = profile.get('photo')        .value()
    const resumeId    = profile.get('resume')       .value()

    const prefix1 = `${name}, ${age} years old.\n`
    const prefix2 = `Stack: ${stackText}\n\n`

    msgEntities = msgEntities.map((val) => {
        let result = Object.assign({}, val)
        result.offset += prefix1.length + prefix2.length
        return result
    })
    msgEntities.push({ type: 'bold', offset: 0, length: prefix1.length })
    msgEntities.push({ type: 'italic', offset: prefix1.length, length: prefix2.length })
    
    const text = prefix1 + prefix2 + description

    if(photoId !== undefined && photoId !== null) {
        await ctx.replyWithPhoto(photoId, { caption: text, caption_entities: msgEntities, reply_markup: keyboard })
    } else {
        await ctx.reply(text, { entities: msgEntities, reply_markup: keyboard })
    }

    if(resumeId !== undefined && resumeId !== null) {
        await ctx.replyWithDocument(resumeId)
    }

}