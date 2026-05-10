export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    })
  }

  try {
    const response = await fetch(
      "https://vgrapi-sea.vnggames.com/coordinator/api/v1/code/redeem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: "https://giftcode.vnggames.com",
          Referer: "https://giftcode.vnggames.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "X-Client-Region": "VN",
        },
        body: JSON.stringify(req.body),
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
