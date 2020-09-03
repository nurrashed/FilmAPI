const db = require('../db');

actorsController = () => {
    get = async (req, res) => {
        try{
            const records = await db.get(req, res, 'actor');
            if (res.statusCode == 404)
                return res.send('Could not find the resource');

            return res.json(records);
        }
        catch (err) {
            return res.status(404);
        }
    };
}

module.exports = actorsController;