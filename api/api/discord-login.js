module.exports = async function handler(req, res) {

    const clientId =
        process.env.DISCORD_CLIENT_ID;

    const clientSecret =
        process.env.DISCORD_CLIENT_SECRET;

    const redirectUri =
        "https://pixel-bot-dashboard.vercel.app/api/discord-login";


    try {

        // If there is no authorization code,
        // start Discord OAuth
        if (!req.query.code) {

            const discordUrl =
                "https://discord.com/oauth2/authorize" +
                "?client_id=" +
                encodeURIComponent(clientId) +
                "&response_type=code" +
                "&redirect_uri=" +
                encodeURIComponent(redirectUri) +
                "&scope=" +
                encodeURIComponent(
                    "identify guilds"
                );


            return res.redirect(
                302,
                discordUrl
            );

        }


        // Exchange Discord authorization code
        // for an access token
        const tokenResponse =
            await fetch(
                "https://discord.com/api/oauth2/token",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body:
                        new URLSearchParams({

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


        if (!tokenResponse.ok) {

            console.error(
                "Discord token error:",
                tokenData
            );


            return res
                .status(400)
                .send(
                    "Discord authentication failed."
                );

        }


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


        if (!userResponse.ok) {

            return res
                .status(400)
                .send(
                    "Could not get Discord profile."
                );

        }


        // Store user information
        // and Discord access token
        const userData =
            Buffer
                .from(
                    JSON.stringify({

                        id:
                            user.id,

                        username:
                            user.username,

                        avatar:
                            user.avatar,

                        accessToken:
                            tokenData.access_token

                    })
                )
                .toString(
                    "base64"
                );


        // Save login cookie
        res.setHeader(
            "Set-Cookie",

            `pixelbot_user=${userData}; Path=/; HttpOnly; Secure; SameSite=Lax`
        );


        // Send user to dashboard
        return res.redirect(
            302,
            "/dashboard.html"
        );

    }


    catch (error) {

        console.error(
            "Discord OAuth error:",
            error
        );


        return res
            .status(500)
            .send(
                "Discord login error."
            );

    }

};
