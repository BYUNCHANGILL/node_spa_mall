// /routes/goods.js
const express = require('express');
const router = express.Router();
const Goods = require("../schemas/goods.js");
const Cart = require("../schemas/cart.js");
const authMiddleware = require('../middlewares/auth-middleware.js');

// 장바구니 목록 조회 API
router.get("/goods/cart", authMiddleware, async (req, res) => {
    const {userId} = res.locals.user;
    const carts = await Cart.find({userId: userId});

    // goodsId만 추출
    const goodsIds = carts.map((cart) => {
        return cart.goodsId;
    });

    // Goods에 해당하는 모든 정보를 가지고 오고,
    // goodsIds 변수 안에 존재하는 값일 때에만 조회한다.
    const goods = await Goods.find({goodsId: goodsIds});

    // goodsIds에 존재하는 goodsId를 가지고 있는 goods를 찾아서
    // carts에 있는 quantity와 함께 반환한다.
    const results = carts.map((cart) => {
        return {
            "quantity": cart.quantity,
            "goods": goods.find((item) => item.goodsId === cart.goodsId)
        }
    });

    res.json({
        "carts": results,
    });
});

// 상품 목록 조회 API
router.get('/goods', async (req, res) => {
    const { category } = req.query;

    const goods = await Goods.find(category ? { category } : {}).sort("-date").exec();

    const result = goods.map((item) => {
        return {
            goodsId: item.goodsId,
            name: item.name,
            thumbnailUrl: item.thumbnailUrl,
            category: item.category,
            price: item.price
        }
    });

    res.status(200).json({ goods: result });
});

// 상품 상세 조회 API
router.get('/goods/:goodsId', async (req, res) => {
    const { goodsId } = req.params;

    const goods = await Goods.findOne({goodsId: goodsId}).sort("-date").exec();

    const result = {
        goodsId: goods.goodsId,
        name: goods.name,
        thumbnailUrl: goods.thumbnailUrl,
        category: goods.category,
        price: goods.price
    };

    res.status(200).json({ goods: result });
});

// 장바구니 등록 API
router.post("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
    const {userId} = res.locals.user;
    const {goodsId} = req.params;
    const {quantity} = req.body;

    // 장바구니를 사용자 정보(userId)를 가지고, 장바구니를 조회한다.
    const existsCarts = await Cart.find({userId, goodsId});
    if (existsCarts.length > 0) {
        return res.status(400).json({
            success: false,
            errerMessage: "이미 장바구니에 담긴 상품입니다."
        });
    }

    // 해당하는 사용자의 정보(userId)를 가지고, 장바구니에 상품을 추가한다.
    await Cart.create({userId, goodsId, quantity});

    res.json({result: "success"});
});

// 상품 등록 API
router.post("/goods", async (req, res) => {
    const {goodsId, name, thumbnailUrl, category, price} = req.body;

    // db에 goodsId 중복 체크
    // await 동기적 처리
    const goods = await Goods.find({goodsId});

    if (goods.length > 0) {
        return res.status(400).json({
            success: false,
            errerMessage: "이미 존재하는 goodsId입니다."
        });
    }

    const createdGoods = await Goods.create({goodsId, name, thumbnailUrl, category, price});

    res.json({goods: createdGoods});
});

// 장바구니 수정 API
router.put("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
    const {userId} = res.locals.user;
    const {goodsId} = req.params;
    const {quantity} = req.body;

    const existsCarts = await Cart.find({userId, goodsId});
    if (existsCarts.length) {
        await Cart.updateOne({userId, goodsId}, {$set: {quantity}});
    }

    res.status(200).json({success: true});
});

// 장바구니 삭제 API
router.delete("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
    const {userId} = res.locals.user;
    const {goodsId} = req.params;

    const existsCarts = await Cart.find({userId, goodsId});
    if (existsCarts.length) {
        await Cart.deleteOne({userId, goodsId});
    }

    res.status(200).json({success: true});
});

module.exports = router;