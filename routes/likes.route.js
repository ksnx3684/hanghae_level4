const express = require("express");
const { Op, json } = require("sequelize");
const { Posts, Likes, sequelize } = require("../models");
const router = express.Router();
const { Transaction } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middleware");

// 게시글 좋아요 API
router.put("/:postId/like", authMiddleware, async (req, res) => {
    const t = await sequelize.transaction({
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
    try {
        const { postId } = req.params;
        const { nickname, userId } = res.locals.user;
        const post = await Posts.findOne({ where: { postId } });

        if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

        const like = await Likes.findOne({
            where: {
                [Op.and]: [{ postId }, { userId }]
            }
        });

        if (!like) {
            await Likes.create({ postId, userId }, { transaction: t });
            await Posts.increment(
                { likes: + 1 }, { transaction: t, where: { postId } }
            );
            await t.commit();
            return res.status(200).json({ message: "게시글의 좋아요를 등록하였습니다."});
        } else {
            await Likes.destroy({ transaction: t,
                where: {
                    [Op.and]: [{ postId }, { userId }]
                }
            });
            await Posts.decrement(
                { likes: + 1 }, { transaction: t, where: { postId } }
            );
            await t.commit();
            return res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다."});
        }
        
    } catch(err) {
        console.log(err.message);
        await t.rollback();
        return res.status(400).json({ errorMessage: "게시글 좋아요 실패하였습니다." });
    }
});


// 좋아요 게시글 조회 API
router.get("/like", authMiddleware, async (req, res) => {
    try {
        const { nickname, userId } = res.locals.user;
        const posts = await Likes.findAll({
            include: [{
                model: Posts,
                attributes: ['postId', 'userId', 'nickname', 'title', 'createdAt', 'updatedAt', 'likes']
            }],
            where: { userId },
            attributes: [],
            order: [[Posts, 'likes', 'desc']]
        });
        return res.status(200).json({ posts });
    } catch(err) {
        console.log(err);
        return res.status(400).json({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." })
    }  
});


module.exports = router;