module.exports = async function(ctx, cardId, keyboard) {
    
    const db = ctx.state.db
    
    const card = db.get('cards').find({ id: cardId }).value()
    const company = db.get('companies').find({ id: card.companyOwnerId }).value()

    const prefix = `${company.name}\n\n`
    const text = prefix + `${card.description}`

    let entities = [...card.descriptionEntities]
    entities = entities.map((val) => {
        let result = Object.assign({}, val)
        result.offset += prefix.length
        return result
    })
    entities.push({ type: 'bold', offset: 0, length: prefix.length })

    const photoId     = card.photo
    const documentId  = card.document

    if(photoId !== undefined && photoId !== null) {
        await ctx.replyWithPhoto(photoId, { caption: text, caption_entities: entities, reply_markup: keyboard })
    } else {
        await ctx.reply(text, { entities: entities, reply_markup: keyboard})
    }

    if(documentId !== undefined && documentId !== null) {
        await ctx.replyWithDocument(documentId)
    }
}