module.exports = async function handler(req, res) {

    const cookies = req.headers.cookie || "";

    const match = cookies.match(
        /pixelbot_user=([^;]+)/
    );

    if (!match) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    try {

        const user = JSON.parse(
            decodeURIComponent(match[1])
        );

        return res.status(200).json(user);

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

        return res.status(500).json({
            error: "Could not load user"
        });

    }

};
