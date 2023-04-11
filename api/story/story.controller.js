const logger = require('../../services/logger.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const storyService = require('./story.service')

async function getStories(req, res) {
    try {
        console.log('getStories-back');
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip) : 0;

        const stories = await storyService.query(req.query, limit, skip)
        res.send(stories)
    } catch (err) {
        logger.error('Cannot get stories', err)
        res.status(500).send({ err: 'Failed to get stories' })
    }
}

async function getStory(req, res) {
    try {
        const story = await storyService.getById(req.params.id)
        res.send(story)
    } catch (err) {
        logger.error('Failed to get story', err)
        res.status(500).send({ err: 'Failed to get story' })
    }
}

async function deleteStory(req, res) {
    try {
        const deletedCount = await storyService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove story' })
        }
    } catch (err) {
        logger.error('Failed to delete story', err)
        res.status(500).send({ err: 'Failed to delete story' })
    }
}

// async function addStory(req, res) {

//     // var loggedinStory = authService.validateToken(req.cookies.loginToken)
//     try {
//         var story = req.body
//         story.byStoryId = loggedinStory._id
//         story = await storyService.add(story)

//         // prepare the updated story for sending out
//         story.aboutStory = await storyService.getById(story.aboutStoryId)

//         // Give the story credit for adding a story
//         // var story = await storyService.getById(story.byStoryId)
//         // story.score += 10
//         loggedinStory.score += 10

//         loggedinStory = await storyService.update(loggedinStory)
//         story.byStory = loggedinStory

//         // Story info is saved also in the login-token, update it
//         const loginToken = authService.getLoginToken(loggedinStory)
//         res.cookie('loginToken', loginToken)


//         socketService.broadcast({ type: 'story-added', data: story, storyId: loggedinStory._id.toString() })
//         socketService.emitToStory({ type: 'story-about-you', data: story, storyId: story.aboutStoryId })

//         const fullStory = await storyService.getById(loggedinStory._id)
//         socketService.emitTo({ type: 'story-updated', data: fullStory, label: fullStory._id })

//         res.send(story)

//     } catch (err) {
//         logger.error('Failed to add story', err)
//         res.status(500).send({ err: 'Failed to add story' })
//     }
// }

async function addStory(req, res) {
    console.log('back-story-controler');
    const story = req.body
    // console.log('req.body', story);
    try {
        const addedStory = await storyService.add(story)
        // broadcast({ type: 'something-changed', storyId: req.session?.story._id })
        res.json(addedStory)
    } catch (err) {
        res.status(500).send(err)
    }
}


async function updateStory(req, res) {
    try {
        const story = req.body
        const savedStory = await storyService.update(story)
        console.log('STORY', savedStory);
        res.send(savedStory)
    } catch (err) {
        logger.error('Failed to update story', err)
        res.status(500).send({ err: 'Failed to update story' })
    }
}


module.exports = {
    getStories,
    getStory,
    deleteStory,
    addStory,
    updateStory
}