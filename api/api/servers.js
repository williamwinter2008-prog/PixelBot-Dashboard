module.exports = async function handler(req, res) {

    const cookies =
        req.headers.cookie || "";

    const match =
        cookies.match(
            /pixelbot_user=([^;]+)/
        );


    if (!match) {

        return res
            .status(401)
            .json({
                error:
                    "Not logged in"
            });

    }


    try {

        const user =
            JSON.parse(
                Buffer
                    .from(
                        match[1],
                        "base64"
                    )
                    .toString("utf8")
            );


        if (!user.accessToken) {

            return res
                .status(401)
                .json({
                    error:
                        "Discord authorization expired"
                });

        }


        // Get Discord servers
        const response =
            await fetch(
                "https://discord.com/api/users/@me/guilds",
                {
                    headers: {
                        Authorization:
                            `Bearer ${user.accessToken}`
                    }
                }
            );


        if (!response.ok) {

            return res
                .status(400)
                .json({
                    error:
                        "Could not get Discord servers"
                });

        }


        const guilds =
            await response.json();


        // Only show servers the user can manage
        const manageableGuilds =
            guilds.filter(
                guild => {

                    const permissions =
                        BigInt(
                            guild.permissions
                        );

                    const ADMINISTRATOR =
                        BigInt(8);

                    const MANAGE_GUILD =
                        BigInt(32);


                    return (
                        (permissions &
                            ADMINISTRATOR) ===
                            ADMINISTRATOR
                    ) ||
                    (
                        (permissions &
                            MANAGE_GUILD) ===
                            MANAGE_GUILD
                    );

                }
            );


        return res
            .status(200)
            .json(
                manageableGuilds
            );

    }


    catch (error) {

        console.error(
            "Server list error:",
            error
        );


        return res
            .status(500)
            .json({
                error:
                    "Could not load servers"
            });

    }

};
