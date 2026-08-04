module.exports = async function handler(req, res) {

    const clientId = process.env.DISCORD_CLIENT_ID;

    const redirectUri =
        "https://pixel-bot-dashboard.vercel.app/api/discord-login";

    // If Discord sends the user back with a code,
    // send them to the dashboard for now.
    if (req.query.code) {
        return res.redirect(302, "/dashboard.html");
    }

    // Start Discord OAuth login
    const discordUrl =
        "https://discord.com/oauth2/authorize" +
        "?client_id=" + encodeURIComponent(clientId) +
        "&response_type=code" +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent("identify guilds");

    return res.redirect(302, discordUrl);
};
