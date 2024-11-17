const express = require('express');
const router = express.Router()
const {createChatController,getUserId,chatAndMsg,groupChat,displayGroups,groupAndMsg,groupReceiver,groupMsgReturn} = require('../controlls/chatControll')
const auth = require('../middleware/authentication')


router.post('/createChat',auth,createChatController)
router.get('/getUser',auth,getUserId)
router.post('/message',auth,chatAndMsg)
router.post('/groupChat',groupChat)
router.get('/groups',displayGroups)
router.post('/groupmsg',auth,groupAndMsg)
router.post('/groupmembers',groupReceiver)
router.post('/returnmsg',groupMsgReturn)



module.exports = router