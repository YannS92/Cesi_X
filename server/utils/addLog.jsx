const User = require("../models/user");

const addLog = async (userId, action) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.logHistory.push({ action });
            await user.save();
        }
    } catch (error) {
        console.error('Error adding log:', error);
    }
};

module.exports = addLog;
