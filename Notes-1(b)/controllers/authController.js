const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    const foundUser = usersDB.users.find(person => person.username === user);
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    
    if (match) {
        const roles = Object.values(foundUser.roles);
        
        // create JWTs(JSON Web Tokens)
        //JWT's confirm authorization
        //allow accss to API endpoints 
        //endpoints provides data resources


        //first you pass a payload to jwt-->username in this case
        //not password as it hurts security
        //payload is available to all if they have your token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Saving refreshToken with current user in the database
        // creates a logout route
        // allow us to invalidate when a user logsout
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser, refreshToken };
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );

        // passing refresh token in a cookie
        // jwt is the name of the cookie 
        // httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000
        // httpOnly-->makes it unavailable to js 
        // maxAge is one day
        //to test the refresh token with thunderclient remove secure:true 
        //but in production and chrome you need secure:true
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        
        //sending the access token as JSON for the front end devp
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };