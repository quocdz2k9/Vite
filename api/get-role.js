export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    })
  }

  try {
    const body = new URLSearchParams({
      platform: "mobile",
      clientKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjIjoiMTAxMDQ5IiwiYSI6IjEwMTA0OSIsInMiOjF9.gRZXpz23XDuCB_Px8INGXldSlaGiCCsuIvw5dfjuXEY",
      loginType: "9",
      lang: "VI",
      roleID: req.body.roleID,
      roleName: req.body.roleID,
      getVgaId: "0",
    })

    const response = await fetch(
      "https://billing.vnggames.com/fe/api/auth/quick",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://shop.vnggames.com",
          Referer: "https://shop.vnggames.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body,
      },
    )

    const text = await response.text()

    try {
      const data = JSON.parse(text)

      return res.status(response.status).json(data)
    } catch {
      return res.status(response.status).json({
        message: text,
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: String(error),
    })
  }
}
