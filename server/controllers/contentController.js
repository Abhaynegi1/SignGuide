const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const jwtsec = process.env.JWT_SECRET;

exports.markContentComplete = async (req, res) => {
    try {
        const { token } = req.cookies;
        const { type, id } = req.body;

        if (!token) return res.status(401).json({ message: 'Token not found' });

        const decoded = jwt.verify(token, jwtsec);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if this content is already completed by the user
        const isAlreadyCompleted = user.completedContent.some(
            content => content.type === type && content.id === id
        );

        if (!isAlreadyCompleted) {
            // Update progress count
            user.progress[type] = user.progress[type] + 1;
            
            // Add to completed content list
            user.completedContent.push({
                type,
                id,
                timestamp: new Date()
            });

            await user.save();
        }

        res.json({
            message: 'Content marked as completed',
            progress: user.progress,
            completedContent: user.completedContent
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Token not found' });

        const decoded = jwt.verify(token, jwtsec);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            progress: user.progress,
            completedContent: user.completedContent
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
