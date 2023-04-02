const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const { useStore } = require('vuex')

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        console.log('query-storyService');
        const collection = await dbService.getCollection('story')
        let stories = await collection.find(criteria).toArray()

        stories = stories.map(story => {
            // story.createdAt = ObjectId(story._id).getTimestamp()
            const timestamp = ObjectId(story._id).getTimestamp()
            const formattedTimestamp = new Date(timestamp)
                .toLocaleString('en-US', { timeZone: 'UTC' })

            const miliSec = new Date(timestamp).getTime()
            const timeAgo = Date.now() - miliSec

            story.timeAgoMiliSec = timeAgo
            story.createdAt = formattedTimestamp
            return story
        })

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
        var id = ObjectId(story._id)
        delete story._id

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


