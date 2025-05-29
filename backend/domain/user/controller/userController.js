const userService = require('../service/userService');

exports.getAllUsers = (req, res) => {
    const users = userService.getAllUsers();
    res.json(users);
};

exports.getUserById = (req, res) => {
    const user = userService.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
};
