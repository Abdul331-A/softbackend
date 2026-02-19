import express from 'express';
import { accessConversation, addToGroup, createGroupConversation, fetchConversations, removeUserFromGroup, renameGroup } from '../controller/converationController.js';
import protect from '../middleware/authMiddleware.js';

const conversationRouter = express.Router();

conversationRouter.post("/", protect, accessConversation);
conversationRouter.get("/getconversation", protect, fetchConversations);
conversationRouter.post("/creategroup", protect, createGroupConversation);
conversationRouter.put("/renamegroup", protect, renameGroup);
conversationRouter.put("/addtogroup", protect, addToGroup);
conversationRouter.put("/removeuserfromgroup", protect, removeUserFromGroup);

export default conversationRouter;