import axios from "axios";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  footer: {
    text: string;
  };
  fields?: {
    name: string;
    value: string;
    inline: boolean;
  }[];
}

interface DiscordEmbedMessage {
  embeds: DiscordEmbed[];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, reason: bug_description, time: timestamp } = body;
  const validTitles = ["Bug", "Feature Request", "UI Issue", "Contact", "Error"];

  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  const username = body.id || auth.payload.username;

  if (!bug_description || !title || !validTitles.includes(title)) {
    return errorResponse("Required Parameters Not Matched!");
  }

  try {
    const initDb = await useMongo();
    const db = initDb.db('college_db').collection("users1");
    const user = await db.findOne({ username: auth.payload.username });

    if (!user) {
      return errorResponse("Unauthorized Access!");
    }

    const embedMessage: DiscordEmbedMessage = {
      embeds: [
        {
          title: `${auth.payload.username}${title ? ` (${title})` : ""}`,
          description: bug_description,
          color: 5814783,
          footer: {
            text: timestamp || "",
          },
        },
      ],
    };

    if (username) {
      embedMessage.embeds[0].fields = [
        {
          name: "Id",
          value: `> ${username}`,
          inline: false,
        },
      ];
    }

    const response = await axios.post(String(process.env.D_REPORT), embedMessage);

    if (response.status === 204) {
      let successMessage = "Issue Reported Successfully!";
      switch (title) {
        case "Bug":
          successMessage = "Bug Reported Successfully!";
          break;
        case "Ui":
          successMessage = "UI Bug Reported Successfully!";
          break;
        case "RequestFeature":
          successMessage = "Feature Requested Successfully!";
          break;
        case "Contact":
          successMessage = "We Will Respond In 24 Hours To The Email Provided.";
          break;
        case "Error":
          successMessage = "Thank you for reporting this issue. Our team has been notified and will resolve it as soon as possible!";
          break;
      }
      return NextResponse.json({ success: true, message: successMessage });
    } else {
      return errorResponse("Failed To Report!");
    }
  } catch (err) {
    console.log("Error From /api/tools/report:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}