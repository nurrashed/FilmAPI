const express = require('express');
const actorsController = require ('../Controllers/actorsController');

function routes(){
    const actorRouter = express.Router();
    const controller = actorsController();

    actorRouter.route('/actors')
        .get(controller.get)
        .post(controller.post);

    actorRouter.route('/actors/:Id')
        .get(controller.get)
        .put(controller.put)
        .delete(controller.remove);

        return actorRouter;
}

module.exports = routes;