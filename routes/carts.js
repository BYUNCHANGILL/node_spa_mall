const express = require('express');
const router = express.Router();

const Cart = require("../schemas/cart.js");
const Goods = require("../schemas/goods.js");

// 장바구니 목록 조회 API
router.get("/carts", async (req, res) => {
    const carts = await Cart.find({});

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
            "goods": goods.find((goods) => item.goodsId === cart.goodsId)
        }
    });

    res.json({
        "carts": results
    });
});


module.exports = router;