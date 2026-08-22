import axios from "axios";
import { useMongo } from "@/lib/database/useMongo";

import { NextRequest, NextResponse } from "next/server";

import { PARAMETERS, UNAUTHORIZED } from "@/shared/utils/messages";

import {
  requireAuthResponse,
  errorResponse,
} from "@/server/utils/functions";

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

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { reason } = body;

  if (!reason) return errorResponse(PARAMETERS);

  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db("college_db").collection("users");
    const user = await db.findOne({ username: auth.payload.username });

    if (!user) return errorResponse(UNAUTHORIZED);

    const deleteResult = await db.deleteOne({ username: auth.payload.username });

    if (deleteResult.deletedCount !== 1) return errorResponse("Failed To Delete Account!");
    
    const embedMessage: DiscordEmbedMessage = {
      embeds: [
        {
          title: `${auth.payload.username} (Account Deleted)`,
          description: reason,
          color: 15158332,
          fields: [
            {
              name: "Username",
              value: `> ${auth.payload.username}`,
              inline: false,
            },
            {
              name: "Reason",
              value: `> ${reason}`,
              inline: false,
            },
          ],
          footer: {
            text: new Date().toISOString(),
          },
        },
      ],
    };

    try {
      await axios.post(String(process.env.D_REPORT), embedMessage);
    } catch (discordError) {
      console.log("Discord notification failed for account deletion:- ", discordError);
    }

    return NextResponse.json({ success: true, message: "Data Deleted Successfully!" });
  } catch (err) {
    console.log("Error From /api/auth/delete:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}