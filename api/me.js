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

        return res
            .status(200)
            .json(user);

    } catch (error) {

        console.error(
            "Cookie error:",
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Invalid login"
            });
    }

};
