const express = require("express");
const { Op, ValidationErrorItemOrigin } = require("sequelize");
const { Posts } = require("../models");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const validation = require("../middlewares/validation");
const { check, body } = require("express-validator");


// 게시글 작성
router.post("/", authMiddleware,
  [ // validation 체크
    body("title").custom((value, { req }) => {
        if (!value && !req.body.content)
            throw new Error('데이터 형식이 올바르지 않습니다.');
        return true;
    }),
    check("title").not().isEmpty().withMessage("게시글 제목의 형식이 일치하지 않습니다."),
    check("content").not().isEmpty().withMessage("게시글 내용의 형식이 일치하지 않습니다."),
    validation,
  ],
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const { nickname, userId } = res.locals.user;
      await Posts.create({ userId, nickname, title, content, likes: 0 });

      return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
    } catch (err) {
      console.log(err.message);
      return res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    }
  }
);


// 게시글 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: ['postId', 'userId', 'nickname', 'title', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'desc']]
    });
    
    return res.status(200).json({posts: posts});
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});


// 게시글 상세 조회
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Posts.findOne({
      where: { postId: postId },
      attributes: ['postId', 'userId', 'nickname', 'title', 'content', 'createdAt', 'updatedAt']
    });

    if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

    return res.status(200).json({ post: post });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});


// 게시글 수정
router.put("/:postId", authMiddleware,
  [ // validation 체크
    body("title").custom((value, { req }) => {
        if (!value && !req.body.content)
            throw new Error('데이터 형식이 올바르지 않습니다.');
        return true;
    }),
    check("title").not().isEmpty().withMessage("게시글 제목의 형식이 일치하지 않습니다."),
    check("content").not().isEmpty().withMessage("게시글 내용의 형식이 일치하지 않습니다."),
    validation,
  ],
  async (req, res) => { 
    try {
      const { postId } = req.params;
      const { title, content } = req.body;
      const { nickname, userId } = res.locals.user;

      const post = await Posts.findOne({
        where: { postId: postId } 
      });

      if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

      if (post.nickname !== nickname)
        return res.status(403).json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });

      await Posts.update(
        { title, content },
        { where: { postId: postId } }
      ).catch((err) => {
        return res.status(401).json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
      });

      return res.status(200).json({ message: "게시글을 수정하였습니다." });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
    }
  }
);


// 게시글 삭제
router.delete("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { nickname } = res.locals.user;
  try {
    const post = await Posts.findOne({
      where: { postId: postId }
    });
    
    if (!post) return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });

    if (!nickname || post.nickname !== nickname)
      return res.status(403).json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });

    await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { nickname }]
      }
    }).catch((err) => res.status(401).json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." }));

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});


module.exports = router;