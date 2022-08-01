const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addStory, getStories, getStory, deleteStory, updateStory } = require('./story.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getStories)
router.get('/:id', getStory)
router.post('/', log, addStory)
router.delete('/:id', deleteStory)
// router.put('/:id', requireAuth, updateStory)
router.put('/:id', updateStory)


module.exports = router