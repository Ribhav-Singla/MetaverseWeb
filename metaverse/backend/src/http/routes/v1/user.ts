import express from 'express'
import client from '../../../db/index'
import { userMiddleware } from '../../middleware/user'
import { UpdateMetadataSchema } from '../../types'

export const userRouter = express.Router()

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    console.log('inside metadata');

    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({ message: "Validation failed" })
        return
    }

    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({ message: "Metadata updated" })
    } catch (e) {
        console.log("error")
        res.status(400).json({ message: "Internal server error" })
    }
})

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdString).slice(1, userIdString?.length - 1).split(",");
    console.log(userIds)
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select: {
            avatar: true,
            id: true
        }
    })

    res.json({
        avatars: metadata.map((m: any) => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })
})