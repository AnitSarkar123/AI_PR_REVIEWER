import {NextResponse,NextRequest} from 'next/server'

export async function POST(req:NextRequest){
    try {
        const body = await req.json()
        const event =req.headers.get("X-gitHub-event")
        if(event =="ping"){
            return NextResponse.json({message:"pong"},{status:200})

        }
        //HANDELED LATER
        return NextResponse.json({message:"Event received"},{status:200})
    } catch (error) {
        console.log("Error handling GitHub webhook:", error)
        return NextResponse.json({message:"Error handling webhook"},{status:500})
    }
}