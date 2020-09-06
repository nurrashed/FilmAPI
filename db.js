const sql = require('mssql');
const config = require('./config');


createHateoasLinks = (req, records, hateoas) =>
{
    return records.recordset.map((record) => {
        record.links = {};

        hateoas.forEach(link => 
            record.links[link.property.toLowerCase() == 'actorid' ? 'self' : link.property.toLowerCase()] = 
            `http://${req.headers.host}/api/${link.endpoint}/${record[link.property]}`);
        
        return record;
    });
}


jsonKeysToLowerCase = (record) => Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k[0].toLowerCase()+k.substring(1), v]));


get = async (req, res, endpoint, hateoas = [], ...params) => {
    try {
        let parameters = '';
        params.forEach(param => parameters += `, ${param}`);
        
        let query = req.params.Id > 0 ?
            `EXEC Get${endpoint}ById ${req.params.Id}${parameters}`:
            `EXEC Get${endpoint}s ${parameters.length < 2 ? '' : parameters.substring(2)}`;

            await sql.connect(config);
            result =  await sql.query(query);
            
            if (result.recordset.length == 0) {
                res.status(404);
                return result;
            }
                        
            hateoas.push({ property: 'ActorId', endpoint: `${endpoint}s` });

            const records = createHateoasLinks(req, result, hateoas);
            
        return req.params.Id > 0 ? records[0] : records;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
};


createSqlParameters = (req, res, ...bodyProperties) => {
    try {
        let hasAllBodyProperties = false;
        let id = '';

        if(req.method == 'PUT' && req.params.hasOwnProperty('Id') && req.params.Id > 0)
            id = `${req.params.Id},`;
        else if(req.method == 'DELETE' && req.params.hasOwnProperty('Id') && req.params.Id > 0)
            id = `${req.params.Id}`;
        /* else{
            res.status(400);
            return res.send('Valid Id URI parameter is required.');
        } */
        
        let sqlParameters = `${id} `;
        
        bodyProperties.forEach(prop => {
            let hasProperty = false;
            let value = null; 
            if (typeof prop === 'string') 
            {
                hasProperty = req.body.hasOwnProperty(prop);
                hasAllBodyProperties = hasAllBodyProperties || hasProperty;
                value = req.body[prop];
            }
            else if (typeof prop === 'object') {
                let propertyName = Object.getOwnPropertyNames(prop)[0];
                hasProperty = req.body.hasOwnProperty(propertyName);
                if(hasProperty){
                    hasAllBodyProperties = hasAllBodyProperties || hasProperty;
                    value = req.body[propertyName];
                }
                else value = prop[propertyName];
            }

            if (typeof value === 'string') 
                sqlParameters += `'${value}',`;
            else if (typeof value === 'number')
                sqlParameters += `${value},`;
            else if (typeof value === 'boolean')
                sqlParameters += value ? `1,` : `0,`;
        });

        if (!hasAllBodyProperties && bodyProperties.length > 0) {
            res.sqlError = 'Missing or erroneous properties.';
            res.status(400);
            return;
        }

        res.sqlParameters = sqlParameters.substring(0, sqlParameters.length - 1);
        res.status(201);
    }
    catch (err) {
        res.sqlError = 'Missing or erroneous properties.';
        res.status(500);
    }
}


modify = async (req, res, sp, ...bodyProperties) => {
    try {
        createSqlParameters(req, res, ...bodyProperties);
        if (res.sqlError) return res.send(res.sqlError);
        
        await sql.connect(config);
        var result = await sql.query(`EXEC ${sp} ${res.sqlParameters}`);
        
        if(req.method == 'PUT' || req.method == 'DELETE') {
            res.status(204);
            return res.send(req.method == 'PUT' ? 
                'Update successful.': 'Deleted successfully.');
        }
        
        res.status(201);
        return res.json(jsonKeysToLowerCase(result.recordset[0]));
    }
    catch (err) {
        console.log(err);
        throw err;
    }
};


module.exports = { get, modify };