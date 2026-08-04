module.exports = async function handler(req, res) {

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    const redirectUri =
        "https://pixel-bot-dashboard.vercel.app/api/discord-login";

    try {

        // STEP 1
        // Start Discord Login

        if (!req.query.code) {

            const discordUrl =
                "https://discord.com/oauth2/authorize" +
                "?client_id=" +
                encodeURIComponent(clientId) +
                "&response_type=code" +
                "&redirect_uri=" +
                encodeURIComponent(redirectUri) +
                "&scope=" +
                encodeURIComponent("identify guilds");

            return res.redirect(
                302,
                discordUrl
            );
        }


        // STEP 2
        // Exchange Discord code for access token

        const tokenResponse = await fetch(
            "https://discord.com/api/oauth2/token",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({

                    client_id:
                        clientId,

                    client_secret:
                        clientSecret,

                    grant_type:
                        "authorization_code",

                    code:
                        req.query.code,

                    redirect_uri:
                        redirectUri

                })
            }
        );


        const tokenData =
            await tokenResponse.json();


        // Check for errors

        if (!tokenResponse.ok) {

            console.error(
                "Discord Token Error:",
                tokenData
            );

            return res
                .status(400)
                .send(
                    "Discord authentication failed."
                );
        }


        // STEP 3
        // Get Discord user information

        const userResponse =
            await fetch(
                "https://discord.com/api/users/@me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${tokenData.access_token}`
                    }
                }
            );


        const user =
            await userResponse.json();


        console.log(
            "Logged in user:",
            user
        );


       // STEP 4
// Create a simple login cookie

const userData = encodeURIComponent(
    JSON.stringify({
        id: user.id,
        username: user.username,
        avatar: user.avatar
    })
);

res.setHeader(
    "Set-Cookie",
    `pixelbot_user=${userData}; Path=/; HttpOnly; Secure; SameSite=Lax`
);

return res.redirect(
    302,
    "/dashboard.html"
);
    }


    catch (error) {

        console.error(
            "Discord OAuth Error:",
            error
        );

        return res
            .status(500)
            .send(
                "Something went wrong with Discord login."
            );
    }

};
