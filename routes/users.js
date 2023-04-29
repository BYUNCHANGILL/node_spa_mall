const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

router.post('/users', async (req, res) => {
    const { email, nickname, password, confirmPassword } = req.body;

    // 비밀번호와 비밀번호 확인이 일치하지 않을 경우
    if (password !== confirmPassword) {
        res.status(400).json({
            errorMessage: '패스워드가 일치하지 않습니다.',
        });
        return;
    }

    // 이메일과 닉네임이 이미 존재하는지 확인
    const isExistUsers = await User.findOne({
        $or: [{ email }, { nickname }], // email 또는 nickname이 일치하는 데이터를 찾는다.
    });

    if (isExistUsers) {
        res.status(400).json({
            errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
        });
        return;
    }

    // TODO : 비밀번호 암호화 하기 crypto 라이브러리 사용
    const user = new User({ email, nickname, password });
    await user.save();

    return res.status(201).json({});
});

module.exports = router;