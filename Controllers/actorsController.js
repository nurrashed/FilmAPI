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

    post = async (req, res) => {
        try {
            return await db.modify(req, res, 'AddActor', 'FirstName', 'LastName', 'Gender');
        }
        catch (err) {
            res.status(500);
            return res.send('Unable to create.');
        }
    };


    put = async (req, res) => {
        try {
            return await db.modify(req, res, 'UpdateActor', 'FirstName', 'LastName', 'Gender');
        }
        catch (err) {
            res.status(500);
            return res.send('Unable to update.');
        }
    };

    remove = async (req, res) => {
        try {
            await db.modify(req, res, 'DeleteActor');
        }
        catch (err) {
            console.log(err);
            res.status(500);
            return res.send('Unable to Delete.');
        }
    };


    return { get, post, put, remove };
}



module.exports = actorsController;