const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const { useStore } = require('vuex')

async function query(filterBy = {}) {
    try {
        console.log('query-storyService');
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('story')
        const stories = await collection.find(criteria).toArray()

        // stories = stories.map(story => {
        //     story.byUser = { _id: story.byUser._id, fullname: story.byUser.fullname }
        //     story.aboutUser = { _id: story.aboutUser._id, fullname: story.aboutUser.fullname }
        //     delete story.byUserId
        //     delete story.aboutUserId
        //     return story
        // })

        return stories
    } catch (err) {
        logger.error('cannot find stories', err)
        throw err
    }
}

async function getById(storyId) {
    try {
        const collection = await dbService.getCollection('story')
        const story = await collection.findOne({ _id: ObjectId(storyId) })

        // story.givenReviews = await reviewService.query({ byUserId: ObjectId(story._id) })
        // story.givenReviews = story.givenReviews.map(review => {
        //     delete review.byUser
        //     return review
        // })

        return story
    } catch (err) {
        logger.error(`while finding story by id: ${storyId}`, err)
        throw err
    }
}

async function remove(storyId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('story')
        // remove only if story is owner/admin
        const criteria = { _id: ObjectId(storyId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove story ${storyId}`, err)
        throw err
    }
}

// async function add(story) {
//     try {
//         const storyToAdd = {
//             byUserId: ObjectId(story.byUserId),
//             aboutUserId: ObjectId(story.aboutUserId),
//             txt: story.txt
//         }
//         const collection = await dbService.getCollection('story')
//         await collection.insertOne(storyToAdd)
//         return storyToAdd
//     } catch (err) {
//         logger.error('cannot insert story', err)
//         throw err
//     }
// }

async function add(story) {
    // console.log('adddddddddddddd', story);
    const collection = await dbService.getCollection('story')
    const { ops } = await collection.insertOne(story)
    // console.log('opsopsopsooooooooops', ops);
    return ops[0]
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

async function update(story) {
    try {
        // peek only updatable properties
        var id = ObjectId(story._id)
        delete story._id
        // const storyToSave = {
        //     _id: ObjectId(story._id), // needed for the returnd obj
        //     comments: story.comments,
        //     likedBy: story.likedBy
        // }
        const collection = await dbService.getCollection('story')
        await collection.updateOne({ _id: id }, { $set: { ...story } })
        story._id = id
        return story
    } catch (err) {
        logger.error(`cannot update story ${story._id}`, err)
        throw err
    }
}

module.exports = {
    query,
    getById,
    remove,
    add,
    update
}


