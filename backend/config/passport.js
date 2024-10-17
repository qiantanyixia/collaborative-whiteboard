// backend/config/passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const secretOrKey = process.env.JWT_SECRET || 'your_jwt_secret'; // 从环境变量获取 JWT 密钥

console.log('🔗 Passport 正在使用 User 模型:', !!User);

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                console.error('❌ Passport 错误:', err);
                return done(err, false);
            }
        })
    );
    console.log('🔗 Passport 策略已配置');
};
