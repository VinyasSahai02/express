//... here is rest operator
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        //if no req or even if we do have req we should have roles to make if statement valid
        if (!req?.roles) return res.sendStatus(401);
        const rolesArray = [...allowedRoles];
        //include returns true or false 
        //for each value that is true or false we check which ones are true
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles