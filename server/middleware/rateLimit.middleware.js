import rateLimit from "express-rate-limit";

const letterLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours 
    max: 5, // per ip 5 request only
    message: {
        success: false,
        message: "Aaj ki limit puri ho chuki hai! Kal milte hain. ❤️"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default letterLimiter;