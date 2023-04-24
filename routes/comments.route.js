const express = require("express");
const { Posts, Comments } = require("../models");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const validation = require("../middlewares/validation");
const { check, body } = require("express-validator");


// 댓글 목록 조회 API
router.get("/:postId/comments", async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Posts.findOne({ where: { postId } });

        if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

        const comments = await Comments.findAll({
            where: { postId },
            attributes: ['commentId', 'postId', 'userId', 'nickname', 'comment', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'desc']]
        });

        return res.status(200).json({ comments: comments });
    } catch(err) {
        console.log(err.message);
        return res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
    }
});


// 댓글 생성 API
router.post("/:postId/comments", authMiddleware,
    [ // validation 체크
    check("comment").not().isEmpty().withMessage("데이터 형식이 올바르지 않습니다."),
    validation,
    ],
    async (req, res) => {
        try {
            const { postId } = req.params;
            const { comment } = req.body;
            const { nickname, userId } = res.locals.user;
            const post = await Posts.findOne({ where: { postId } });

            if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

            const comments = await Comments.create({ postId, userId, nickname, comment });

            return res.status(200).json({ message: "댓글을 생성하였습니다." });
        } catch(err) {
            console.log(err.message);
            return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다."});
        }
    }
);


// 댓글 수정 API
router.put("/:postId/comments/:commentId", authMiddleware,
    [ // validation 체크
    check("comment").not().isEmpty().withMessage("데이터 형식이 올바르지 않습니다."),
    validation,
    ],
    async (req, res) => {
        try {
            const { postId, commentId } = req.params;
            const { comment } = req.body;
            const { nickname, userId } = res.locals.user;
            const post = await Posts.findOne({ where: { postId } });

            if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

            const commentOne = await Comments.findOne({ where: { commentId } });

            if (!commentOne) return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });

            if (commentOne.nickname !== nickname) return res.status(403).json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });

            await Comments.update(
                { postId, userId, nickname, comment },
                { where: { commentId: commentId } }
            ).catch((err) => {
                return res.status(400).json({ errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다." });
            });

            return res.status(200).json({ message: "댓글을 수정하였습니다." });
        } catch(err) {
            console.log(err.message);
            return res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다." });
        }
    }
);


// 댓글 삭제 API
router.delete("/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { nickname, userId } = res.locals.user;
        const post = await Posts.findOne({ where: { postId } });

        if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

        const commentOne = await Comments.findOne({ where: { commentId } });

        if (!commentOne) return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });

        if (commentOne.nickname !== nickname) return res.status(403).json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });

        await Comments.destroy(
            { where: { commentId: commentId } }
        ).catch((err) => {
            return res.status(400).json({ errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다." });
        });

        return res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch(err) {
        console.log(err.message);
        return res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
});


module.exports = router;