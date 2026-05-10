import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const body = new URLSearchParams({
      platform: "mobile",
      clientKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjIjoiMTAxMDQ5IiwiYSI6IjEwMTA0OSIsInMiOjF9.gRZXpz23XDuCB_Px8INGXldSlaGiCCsuIvw5dfjuXEY",
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
        },
        body,
      },
    )

    const text = await response.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }

    await supabase.from("cfl_active_users").upsert({
      id: req.body.roleID,
      last_seen: new Date(),
    })

    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: String(error),
    })
  }
}
